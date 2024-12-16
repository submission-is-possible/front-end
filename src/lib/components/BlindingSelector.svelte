<script lang="ts">
    
    import { conference } from '$stores/conferenceStore';
    
    export let onSelection: (key: string) => void;
    export let editable: boolean = true;

    let buttons : {key : string, label : string}[] = [
        { key: 'none', label: 'None' },
        { key: 'single_blind', label: 'Single Blind' },
        { key: 'double_blind', label: 'Double Blind' },
    ];

    let selectedKey: string = $conference?.status.toString() || buttons[0].key;

    function handleClick (key: string) {
        if(editable){
            selectedKey = key;
            if(onSelection){onSelection(key);}
        }
    }


</script>

{#if (editable)}
<div id="Blinding" class="flex w-full gap-x-2">
    {#each buttons as { key, label }}
        <button type="button"
            class="btn flex-1"
            class:btn-active={selectedKey === key}
            on:click={() => handleClick(key)}
        >
            {label}
        </button>
    {/each}
</div>
{/if} 
{#if (!editable)}
<div>   
    <span>{buttons.find(x=>x.key==selectedKey)?.label}</span>
</div>
{/if}

<style>
</style>