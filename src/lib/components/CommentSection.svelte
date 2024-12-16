<script lang="ts">
    import CommentComponent from './CommentComponent.svelte';
    import {Comment} from '$lib/models/comments'
    import {user} from '$stores/userStore'
    import { comment } from 'postcss';

    export let comments: Comments[];
    export let review_id : number;
    let empty_comment: Comment = {user:$user,review_id:review_id,comment_text:'',created_at: Date()};
    let new_comment: Comment = { ...empty_comment };

    async function handleSend() {
        if (new_comment.comment_text.trim()) {
            try {
                const response = await fetch(`http://localhost:8000/comments/create/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        review_id: review_id,
                        comment_text:new_comment.comment_text
                    }),
                    });
                if (response.ok) {
                    getReviewComments();
                }
            } catch (error) {
            console.error('Errore nel salvataggio del commento', error);
            }
        }
    }

    async function getReviewComments(){
        try {
                const response = await fetch(`http://localhost:8000/comments/review/${review_id}/get_comments`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    comments=data;
                    debugger;
                    new_comment = { ...empty_comment };
                }
            } catch (error) {
            console.error('Errore nel salvataggio del commento', error);
            }
    }
</script>

<div>
    {#each comments as comment}
        <CommentComponent comment={comment} />
    {/each}
    <div class="mt-4 form-control w-full p-4 bg-base-100 shadow-md rounded-lg">
        <textarea
            class="textarea textarea-bordered w-full mb-4"
            placeholder="Write your comment here..."
            bind:value={new_comment.comment_text}
        ></textarea>
        <button
            class="btn btn-primary w-full"
            on:click={handleSend}
            disabled={!new_comment.comment_text.trim()}
        >
            Send
        </button>
    </div>
</div>