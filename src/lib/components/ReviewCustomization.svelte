<script lang="ts">
  import CreateItemButton from "./CreateItemButton.svelte";
  import type { ReviewTemplateItem } from "$lib/models/ReviewItem";
  export let onSave:(template:ReviewTemplateItem[]) => void;
  export let toggleModal: ()=>void ;
  let reviewTemplate : ReviewTemplateItem[] = [];

  function addReviewTemplateItem(){
    reviewTemplate=[...reviewTemplate , {label:'', description:'', has_comment: true, has_score: true}];
  }

  function removeRow(index) {
    reviewTemplate = reviewTemplate.filter((_, i) => i !== index);
  }

  function save(){
    if(onSave)
      onSave(reviewTemplate);
    toggleModal();
  }

</script>


<div class="modal modal-open">
  <div class="modal-box w-11/12 max-w-2xl bg-base-100 shadow-xl">
    <div class="flex justify-between items-center pb-4 mb-4">
      <h3 class="text-lg font-bold text-base-content">Review customization</h3>
      <button
        class="btn btn-ghost btn-sm btn-circle"
        onclick={toggleModal}
        aria-label="Close modal">
        ✕
      </button>
    </div>
    <div class="p-4 flex flex-col justify-between">
      <div class="flex justify-end">
        <CreateItemButton onClick={addReviewTemplateItem}/>
      </div>
    </div>
    
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Label</th>
          <th>Description</th>
          <th>Comment</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {#each reviewTemplate as item, index}
          <tr>
            <td>
              <input type="text" bind:value={item.label} placeholder="Name" />
            </td>
            <td>
              <input type="text" bind:value={item.description} placeholder="Description" />
            </td>
            <td>
              <input type="checkbox" bind:checked={item.has_comment} />
            </td>
            <td>
              <input type="checkbox" bind:checked={item.has_score} />
            </td>
            <td>
              <button type="button" onclick={() => removeRow(index)}>Remove</button>
            </td>
          </tr> 
        {/each}
      </tbody>
    </table>

    
    <div class="modal-action mt-4">
      <button
        class="btn btn-primary"
        type="button"
        onclick={save}>
        Save
      </button>
    </div>
  </div>
</div>
