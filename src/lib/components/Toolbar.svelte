<script>
	import { conference } from '$stores/conferenceStore';
  let navItems = [
    { label: 'Detail', link: '/conference/detail', visible: true },
    { label: 'Submissions', link: '/conference/submissions', visible: true },
    { label: 'Review', link: '/conference/submissions/submit', visible: false}
  ];

  </script>
  {#if $conference}
  <div class="bg-base-200 py-2 px-4 shadow-md">
    <nav class="flex justify-between items-center">
      <div class="text-xl font-semibold">
        {$conference?.title}
      </div>
      <ul class="flex space-x-4">
        {#each navItems as item}
          {#if item.visible}
            <li>
              <a href={item.link} class="text-base text-gray-700 hover:text-primary">
                {item.label}
              </a>
            </li>
          {/if}
        {/each}
      </ul>
    </nav>
  </div>
  {/if}