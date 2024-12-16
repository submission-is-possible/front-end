<script lang="ts">
    import {Comment} from '$lib/models/comments'
    export let comment: Comment

    function formatDate(dateStr: string | number | Date) {
        return new Date(dateStr).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    }
</script>

<div class="mt-4 comment shadow-md bg-base-100 p-4 rounded-lg">
    <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-primary">{comment.user?.first_name} {comment.user?.last_name}</span>
        <span class="text-sm text-gray-500 italic">{formatDate(comment.created_at)}</span>
    </div>
    <p class="text-gray-700">{comment.comment_text}</p>
</div>