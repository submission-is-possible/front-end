<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { user } from '$stores/userStore';
  
    interface Conference {
      id: number;
      title: string;
      description: string;
      created_at: string;
      deadline: string;
      roles: string[];
    }
  
    interface Notification {
      id: number;
      sender: string;
      conference: Conference;
      status: string;
    }
  
    let notifications: Notification[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let pageSize = 10;
  

    async function fetchNotifications(page: number = 1) {
        try {
            const response = await fetch(`http://localhost:8000/notifications/?page=${page}&page_size=${pageSize}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: $user?.id, // Supponendo che l'ID utente sia disponibile tramite il tuo store
            }),
            });

            if (!response.ok) {
            throw new Error('Errore nel recupero delle notifiche');
            }

            const data = await response.json();

            // Aggiorna le notifiche e i dati di paginazione
            notifications = data.notifications.map((n: any) => ({
            id: n.id,
            sender: n.sender,
            conference: {
                id: n.conference.id,
                title: n.conference.title,
                description: n.conference.description,
                created_at: n.conference.created_at,
                deadline: n.conference.deadline,
                roles: n.conference.roles,
            },
            status: n.status,
            }));

            currentPage = data.current_page;
            totalPages = data.total_pages;

        } catch (error) {
            console.error('Errore:', error);
        }
    }

  
    async function handleNotificationAction(notificationId: number, status: 'accept' | 'reject') {
      try {
        // Effettua la chiamata al backend
        const response = await fetch(`/notifications/update-notification/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_notification: notificationId,
            status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Errore nella risposta del server: ${response.statusText}`);
        }

        // Aggiorna lo stato della notifica localmente
        notifications = notifications.map((n) =>
          n.id === notificationId ? { ...n, status: status === 'accept' ? 'accept' : 'reject' } : n
        );
      } catch (error) {
        console.error(`Errore durante l'aggiornamento della notifica (${status}):`, error);
        alert('Errore: impossibile aggiornare la notifica.');
      }
    }

  
    onMount(() => {
      fetchNotifications(currentPage);
    });
  
    function goToPage(page: number) {
      if (page >= 1 && page <= totalPages) {
        fetchNotifications(page);
      }
    }
  </script>
  
<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Notifications</h1>

  <!-- Tabella notifiche -->
  <div class="overflow-x-auto" transition:fade>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Sender</th>
          <th>Conference</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
          {#each notifications as notification (notification.id)}
          <tr>
            <td>{notification.sender}</td>
            <td>
              <span class="font-semibold">{notification.conference.title}</span>
              <br />
              <span class="text-sm text-gray-500">
                Deadline: {new Date(notification.conference.deadline).toLocaleDateString('it-IT')}
              </span>
            </td>
            <td class="flex gap-2">
              {#if notification.status === 'pending'}
              <button
                class="btn btn-success btn-sm"
                on:click={() => handleNotificationAction(notification.id, 'accept')}
              >
                Accept
              </button>
              <button
                class="btn btn-error btn-sm"
                on:click={() => handleNotificationAction(notification.id, 'reject')}
              >
                Decline
              </button>
              {:else}
                <span class="text-gray-500">{notification.status === 'accept' ? 'Accepted' : 'Declined'}</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Paginazione -->
  <div class="flex justify-center mt-6">
    <div class="join">
      <!-- Prima pagina -->
      {#if currentPage > 2}
        <button class="join-item btn" on:click={() => goToPage(1)}>1</button>
      {/if}

      <!-- Ellissi prima -->
      {#if currentPage > 3}
        <button class="join-item btn btn-disabled">...</button>
      {/if}

      <!-- Pagina precedente -->
      {#if currentPage > 1}
        <button class="join-item btn" on:click={() => goToPage(currentPage - 1)}>
          {currentPage - 1}
        </button>
      {/if}

      <!-- Pagina corrente -->
      <button class="join-item btn btn-active">{currentPage}</button>

      <!-- Pagina successiva -->
      {#if currentPage < totalPages}
        <button class="join-item btn" on:click={() => goToPage(currentPage + 1)}>
          {currentPage + 1}
        </button>
      {/if}

      <!-- Ellissi dopo -->
      {#if currentPage < totalPages - 2}
        <button class="join-item btn btn-disabled">...</button>
      {/if}

      <!-- Ultima pagina -->
      {#if totalPages > 1 && currentPage < totalPages - 1}
        <button class="join-item btn" on:click={() => goToPage(totalPages)}>
          {totalPages}
        </button>
      {/if}
    </div>
  </div>
</div>  