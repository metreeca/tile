/*
 * Copyright © 2023-2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Transient notices.
 *
 * Offers the stack of notices telling a reader how the operations under way are going and how they ended, floating
 * over the screen without moving anything on it, and read out to assistive technology as they change.
 *
 * @module
 */

import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { type Post, type Status, useBoard, usePosts } from "@metreeca/tile-data/board";
import { createElement } from "preact";
import { useEffect, useState } from "preact/hooks";
import "./toast.css";


/**
 * Creates a toast stack.
 *
 * Floats the posts standing on the enclosing {@link @metreeca/tile-data!board.Board Board} over an edge of the screen,
 * one toast each, newest nearest the edge, each marked by a glyph telling its status, so an interface tells the reader
 * how its operations are going without laying out room for them. A post updated on the board is updated where it
 * stands, a post put up slides in, and a post cleared fades out while the others stay put.
 *
 * Where given a `timeout`, a toast telling of nothing more pressing than a plain or completed post is taken away on
 * its own once it is up, while the post stays on the board for any other reader. Any other toast stays until whoever
 * put its post up clears it, or until the reader deals with it: by dismissing it through the quiet control beside the
 * message, hinted as it is pointed at, or by following the message of an actionable post where an `onAction` handler
 * is given. Either way the post is cleared from the board for every reader. Away from those controls the stack answers
 * no gesture, leaving the pointer to the screen beneath it, so the toasts never stand in the way of what they cover.
 *
 * Every toast takes the same width, so the stack reads as one column, a long message wrapping rather than widening
 * its toast; the width is retuned through the `--tile-toast-width` custom property, `24rem` unless restated, and
 * gives way to the whole width of a narrow screen.
 *
 * Every post put up or updated is read out to assistive technology without moving the focus. The stack is to be
 * rendered once, near the root of the interface, as it is the page region announcements come from; outside any board
 * it shows nothing.
 *
 * @param options The widget configuration
 *
 * @returns The toast stack
 */
export function Toast({

	position = "top",
	timeout = 0,

	onAction

}: {

	/**
	 * Where the stack floats: the edge of the screen it hangs from, and the side of that edge it keeps to, `start` and
	 * `end` following the writing direction; centred on the edge if only the edge is given. The newest toast sits
	 * nearest the edge and slides in from it. On a narrow screen the stack spans the edge whatever the side, so it
	 * keeps every toast legible. One placement serves a whole interface, chosen where its layout leaves room, clear of
	 * the navigation and the main actions; if omitted, the stack hangs from the top edge, centred on it.
	 */
	position?: "top" | "bottom" | readonly ["top" | "bottom", "start" | "center" | "end"]

	/**
	 * The milliseconds the toast of a `normal` or `success` post is shown before it is taken away, counted from the
	 * moment the post was put up or last updated; the post itself stays on the board. The toasts of `pending`,
	 * `warning`, `failure` and `defect` posts stay until their posts are cleared, as do those of actionable posts
	 * whatever their status where an `onAction` handler is given, so nothing still under way, asking for attention or
	 * waiting to be acted on goes unseen. No toast is taken away on its own if not positive, or if omitted.
	 */
	timeout?: number


	/**
	 * What an actionable post is handed to when the reader activates its message, for instance to open what it tells
	 * of or to retry what failed; supplying it turns the message of every actionable post into a control, drawn as a
	 * link. Acting on a post deals with it, so the post is cleared from the board for every reader before it is handed
	 * over, and a handler putting it up again keeps it standing. Messages stay plain text if omitted.
	 */
	onAction?: (post: Post) => void

} = {}) {

	const board = useBoard();
	const posts = usePosts();

	/*
	 * A cleared post has left the board but has yet to fade out, so the stack keeps what it shows and works out what to
	 * show next from it whenever the board changes, during the render that sees the change; a cleared post is let go
	 * only once its fade is over. The stack also keeps the posts whose toasts timed out, as they stood then, so a post
	 * updated since is shown again.
	 */

	const [last, setLast] = useState<Stack>(() => refreshed({ posts: [], shown: [], expired: [] }, posts));

	const stack = last.posts === posts ? last : refreshed(last, posts);

	if ( stack !== last ) { setLast(stack); }

	const { shown, expired } = stack;

	const expire = (post: Post) => setLast(last => ({ ...last, expired: [...last.expired, post] }));
	const drop = (post: Post) => setLast(last => ({ ...last, shown: last.shown.filter(shown => shown !== post) }));

	/*
	 * A post shown but no longer standing is on its way out. The region stays in the page whatever stands, as a live
	 * region has to be there before its content changes for the change to be read out. It is polite, so a post is
	 * read out once the reader is idle rather than cutting them short, and a hidden toast is never read out again.
	 */

	const standing = new Set(posts.map(({ instance }) => instance));

	const gone = (post: Post) => !standing.has(post.instance);
	const hidden = (post: Post) => gone(post) || expired.includes(post);

	const visible = shown.filter(post => !hidden(post));

	const [edge, side] = typeof position === "string" ? [position, "center"] : position;

	return createElement("tile-toast", { role: "status", edge, side }, <> {/* edge and side read by the stylesheet */}

		{shown.map(post => <Item key={post.instance}
			hidden={hidden(post)}
			post={post}
			timeout={timeout}
			onDismiss={() => board.clear(post)}
			onExpire={() => expire(post)}
			onAction={post.actionable && onAction ? () => {

				board.clear(post);
				onAction(post);

			} : undefined}
			onFaded={gone(post) ? () => drop(post) : undefined}
		/>)}

		{visible.length > 1 && <footer>
            <Button name="Dismiss all" icon={<Icon.Dismiss/>} title="Dismiss all" look="subtle"
                onClick={() => board.clear(visible)}
            />
        </footer>}

	</>);

}


/**
 * Creates a toast.
 *
 * @param options The toast configuration
 *
 * @returns The toast telling `post`, hidden if `hidden`. It notifies `onAction` when its message is activated and
 * `onFaded` once it has faded out while hidden. For a plain or completed post still shown and offered for no action,
 * it also notifies `onExpire` once `timeout` is up, so the toast is taken away while the post stays on the board
 */
function Item({

	hidden,

	post,
	timeout,

	onDismiss,
	onExpire,
	onAction,
	onFaded

}: {

	hidden: boolean

	post: Post
	timeout: number

	onDismiss: () => void
	onExpire: () => void
	onAction?: () => void
	onFaded?: () => void

}) {

	useEffect(() => { // a timer outlives the render, so it is started and stopped along with the post it times

		const expiring = !hidden && timeout > 0 && !onAction && (post.status === "normal" || post.status === "success");
		const timer = expiring ? setTimeout(onExpire, timeout) : undefined;

		return () => clearTimeout(timer);

	}, [post, hidden, timeout, !onAction]); // whether the post is offered for action, as the handler is new each render

	/*
	 * The toast sits in a slot of its own, which the stylesheet closes as the toast fades, so the toasts below move up
	 * along with it rather than all at once once it is gone; the bare wrapper between the two is what the slot sizes
	 * on, as a grid never closes a track below the padding of what it holds. The fade is over once the opacity of the slot itself has
	 * run its course, a transition ending on what the toast carries bubbling up as well.
	 */

	return createElement("div", { // the status is read by the stylesheet

		status: post.status,
		hidden: hidden || undefined,

		onTransitionEnd: ({ target, currentTarget, propertyName }: TransitionEvent) =>
			hidden && target === currentTarget && propertyName === "opacity" && onFaded?.()

	}, <div>
		<div>

			{glyph(post.status)}

			<span>{onAction
				? <button type="button" onClick={onAction}>{post.message}</button>
				: post.message
			}</span>

			<div>
				<Button name="Dismiss" icon={<Icon.Dismiss/>} title="Dismiss" look="subtle" onClick={onDismiss}/>
			</div>

		</div>
	</div>);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * What the stack shows, as worked out from the board it last saw.
 */
interface Stack {

	/**
	 * The posts standing on the board as the stack last saw it.
	 */
	readonly posts: readonly Post[];

	/**
	 * The posts the stack shows, newest first, cleared ones included until their toasts have faded out.
	 */
	readonly shown: readonly Post[];

	/**
	 * The posts whose toasts timed out, as they stood then.
	 */
	readonly expired: readonly Post[];

}


/**
 * Works out what the stack shows as the board changes.
 *
 * Posts put up since the stack last looked come first, newest first. The posts it already showed follow, each where
 * it stood. A post still standing is shown as it now stands. A cleared post is shown as it last stood, until its toast
 * has faded out. A cleared post whose toast had already timed out is let go at once, as a hidden toast has no fade
 * left.
 *
 * @param stack The stack as it last stood
 * @param posts The posts now standing on the board
 *
 * @returns The stack as it stands over `posts`, keeping as timed out only the posts still standing
 */
function refreshed({ shown, expired }: Stack, posts: readonly Post[]): Stack {

	const known = new Set(shown.map(({ instance }) => instance));
	const current = new Map(posts.map(post => [post.instance, post]));

	return {

		posts,

		shown: [

			...posts.filter(({ instance }) => !known.has(instance)).reverse(), // the filter hands back a fresh array

			...shown.map(post => current.get(post.instance) ?? post)

		].filter(post => posts.includes(post) || !expired.includes(post)),

		expired: expired.filter(post => posts.includes(post))

	};

}

/**
 * Picks the glyph marking a status.
 *
 * @param status The status of a post
 *
 * @returns The glyph telling `status`: the one a note marks the matching level with, or a bug for a `defect`
 */
function glyph(status: Status) {
	return status === "pending" ? <Icon.RefreshCw/>
		: status === "success" ? <Icon.CircleCheck/>
			: status === "warning" ? <Icon.Alert/>
				: status === "failure" ? <Icon.CircleAlert/>
					: status === "defect" ? <Icon.Bug/>
						: <Icon.Info/>;
}
