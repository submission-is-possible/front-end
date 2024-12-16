<script lang="ts">
    import type {ReviewTemplateItem} from '$lib/models/reviewItemData';

    export let templateItem: ReviewTemplateItem;
    export let editable : boolean = true
</script>

<div class="divider"></div>
{#if editable}
    <div class="divider">{templateItem.label} Evaluation</div>
    {#if templateItem.has_score}
        <!-- Label -->
        <label for="score" class="font-semibold">{templateItem.label} score (0-5):</label>

        <!-- Visualizzazione del punteggio selezionato -->
        <p class="font-bold">Selected Score: {templateItem.score}</p>

        <!-- Barra di selezione -->
        <input
        type="range"
        id="score"
        min="0"
        max="5"
        step="1"
        class="range range-primary w-64"
        bind:value={templateItem.score}
        />
    {/if}
    {#if templateItem.has_comment}
        <!-- Recensione scritta -->
        <div class="form-control w-full max-w-md">
            <label class="label" for="reviewText">
                <span class="label-text font-semibold">Write your review</span>
            </label>
            <textarea
                id="reviewText"
                class="textarea textarea-bordered h-24"
                placeholder="Enter your review here"
                bind:value={templateItem.comment}>
            </textarea>
        </div>
    {/if}
{:else}
    <div class="flex justify-between items-center">
        <div class="text-lg font-semibold">
            {templateItem.label}
        </div>
        {#if templateItem.has_score}
            <div class="badge badge-primary badge-outline">
                Score: {templateItem.score}/5
            </div>
        {/if}
    </div>
    {#if templateItem.has_comment}
        <p class="mt-4 text-base text-gray-700">
            {templateItem.comment}
        </p>
    {/if}
{/if}