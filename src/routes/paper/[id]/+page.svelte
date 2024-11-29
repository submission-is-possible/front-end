<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { paper, setPaper } from '$stores/paperStore';
  import { user } from '$stores/userStore';
  import { conference, setConference } from '$stores/conferenceStore'
  import {Role} from '$lib/models/role';
  import { Paper, goToPaperDetail } from '$lib/models/paper';
  import { get } from 'svelte/store';
  //import type { ConferenceFormData } from '$lib/types';
  import { Conference } from '$lib/models/conference';
  export let data: PageData;


    let canEdit = false;
    let isLoading = true;
    let error: string | null = null;
    let isSubmitting = false;
    let currentUserId: number | null = null;
    let creatorId: number | null = null;
    let adminData: any = null; 

    
    onMount(() => {
        //controlla i ruoli dell'utente e prendi le info necessarie
        try{
            currentPaper = $paper;
            if($conference?.roles.includes(Role.Admin)){
                fetchReviewData();
                canEdit = true;
            }
            if($conference?.roles.includes(Role.Author)){
                //PRENDI DATI AUTHOR
            }
            if($conference?.roles.includes(Role.Reviewer)){
                fetchReviewData();
            }
        } catch (err) {
            error = 'Error loading conference details';
            console.error('Error in onMount:', err);
        } finally {
            isLoading = false;
        }
    });




    let reviewers: { id: number; name: string; email: string; rating: string }[] = []; // Lista dei revisori
    let newReviewerEmail = ''; // Email del nuovo revisore da aggiungere
    let comments = ''; // Area per commenti (placeholder per futura implementazione)

    // Mock paper e revisori (da sostituire con dati reali)
    let currentPaper: Paper | null = null;

    async function fetchReviewData() {
        try {
            // Verifica che il paper sia disponibile
            if (!$paper) {
                throw new Error('Paper non trovato nel store!');
            }

            // Effettua una chiamata GET al backend
            const response = await fetch(`http://localhost:8000/reviewers/${$paper.id}`, {
                method: 'GET',
                credentials: 'include', // Per includere i cookie nella richiesta
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.statusText}`);
            }

            // Recupera i dati e aggiorna la lista dei revisori
            const data = await response.json();
            reviewers = data.reviewers; // Supponendo che il backend restituisca un array di revisori

            console.log('Revisori:', reviewers);
        } catch (error) {
            console.error('Errore nel recupero dei revisori:', error);
        }
    }


    async function addReviewer() {
        try {
            if (newReviewerEmail.trim() === '') {
                alert('Inserisci un indirizzo email valido');
                return;
            }

            // Verifica che il paper sia disponibile
            if (!$paper) {
                throw new Error('Paper non trovato nel store!');
            }

            // Effettua una chiamata POST al backend
            const response = await fetch('http://localhost:8000/reviewers/add/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paper_id: $paper.id,
                    email: newReviewerEmail,
                }),
            });

            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.statusText}`);
            }

            // Recupera il revisore appena aggiunto
            const newReviewer = await response.json();
            reviewers.push(newReviewer); // Aggiorna la lista con il nuovo revisore

            newReviewerEmail = ''; // Resetta il campo di input
            console.log('Revisore aggiunto:', newReviewer);
        } catch (error) {
            console.error('Errore nell\'aggiunta del revisore:', error);
            alert('Errore nell\'aggiunta del revisore. Riprova.');
        }
    }


    async function removeReviewer(reviewerId: number) {
        try {
            const reviewerToRemove = reviewers.find((r) => r.id === reviewerId);
            if (!reviewerToRemove) {
                alert('Revisore non trovato');
                return;
            }

            if (!confirm('Sei sicuro di voler rimuovere questo revisore?')) {
                return;
            }

            // Verifica che il paper sia disponibile
            if (!$paper) {
                throw new Error('Paper non trovato nel store!');
            }

            // Effettua una chiamata DELETE al backend
            const response = await fetch('http://localhost:8000/reviewers/remove/', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paper_id: $paper.id,
                    email: reviewerToRemove.email,
                }),
            });

            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.statusText}`);
            }

            // Aggiorna la lista locale dei revisori
            reviewers = reviewers.filter((r) => r.id !== reviewerId);

            console.log('Revisore rimosso:', reviewerToRemove);
        } catch (error) {
            console.error('Errore nella rimozione del revisore:', error);
            alert('Errore nella rimozione del revisore. Riprova.');
        }
    }



    let evaluation: 'accepted' | 'rejected' | null = null; // Valutazione selezionata ("accepted" o "rejected")
    let showModal = false; // Controlla la visibilità del modale
    const eventDispatcher = createEventDispatcher(); // Per comunicare con il componente genitore



    // vvvvvvvvvvv queste due funzioni sono ugauli perchè non so come chiamare il back end ma avranno poi due chiamate diverse vvvvvvvvvvv

    async function submitEvaluationReviewer(evaluation : string) {
        //chiamata al back per creare/aggiornare la review
    }

    async function submitEvaluationAdmin(evaluation : string) {
        console.log("Cookie presenti nel browser:", document.cookie);
        try {
            const response = await fetch('http://localhost:8000/papers/update_status/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Necessario per includere il cookie CSRF, se richiesto
                body: JSON.stringify({
                    paper_id: $paper?.id,
                    status: evaluation,
                }),
            });

            if (!response.ok) {
                // Gestione degli errori
                if (response.status === 403) {
                    throw new Error('Non sei autorizzato a modificare questo paper.');
                }
                if (response.status === 404) {
                    throw new Error('Paper non trovato o utente non è parte della conferenza.');
                }
                if (response.status === 400) {
                    throw new Error('Richiesta non valida. Controlla i dati inviati.');
                }
                throw new Error('Errore nella richiesta.');
            }

            const data = await response.json();
            console.log('Aggiornamento riuscito:', data.message);
            alert('Lo stato del paper è stato aggiornato con successo!');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento:', error);
            if (error instanceof Error) {
                alert(error.message || 'Errore durante l\'aggiornamento dello stato del paper.');
            } else {
                alert('Errore durante l\'aggiornamento dello stato del paper.');
            }
        } finally {
            showModal = false; // Nascondi il modale
        }
    }

    // ^^^^^^^^^^^^^^^ queste due funzioni sono ugauli perchè non so come chiamare il back end ma avranno poi due chiamate diverse ^^^^^^^^^^^^^^^^





    function dispatch(eventName: string, detail: any) {
        // Utilizzo di `dispatchEvent` direttamente
        const event = new CustomEvent(eventName, { detail });
        dispatchEvent(event);
    }

    



    
    function formatDate(dateStr: string | number | Date) {
        return new Date(dateStr).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    }
    
    function truncate(text: String, maxLength: number) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
</script>


<div class="container mx-auto p-2 md:p-4">
    <!-- Loading State -->
    {#if isLoading}
      <div class="flex justify-center items-center h-64" role="status">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    
    <!-- Error State -->
    {:else if error}
      <div class="alert alert-error shadow-lg mb-6" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
        <button class="btn btn-sm btn-ghost" on:click={() => error = null}>Dismiss</button>
      </div>
  
    <!-- Main Content -->
    {:else if $conference?.roles.includes(Role.Admin) || $conference?.roles.includes(Role.Reviewer)}
        <div class="p-6 bg-base-200 rounded-lg shadow-md">
            {#if currentPaper}
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-primary">{currentPaper.title}</h1>
                    <p class="text-sm text-gray-500"><strong>Autore:</strong> {currentPaper.author}</p>
                    <button
                        class="btn btn-primary mt-4"
                        on:click={() => currentPaper && window.open(currentPaper.paper_file, '_blank')}
                    >
                        Scarica Paper
                    </button>
                </div>
            {:else}
                <div class="alert alert-warning">
                    <span>Caricamento dettagli del paper...</span>
                </div>
            {/if}

            {#if $conference?.roles.includes(Role.Admin)}
            <div class="divider">Chair Evaluation</div>
            {:else if $conference?.roles.includes(Role.Reviewer)}
            <div class="divider">Reviewer Evaluation</div>
            {/if}
            <div class="flex items-center justify-center space-x-4 mt-4">
                <!-- Pulsanti di selezione -->
                <button
                    class="btn btn-outline btn-success"
                    on:click={() => { evaluation = 'accepted'; showModal = true; }}>
                    Accept
                </button>
                <button
                    class="btn btn-outline btn-error"
                    on:click={() => { evaluation = 'rejected'; showModal = true; }}>
                    Reject
                </button>
            </div>

            
            <!-- Modale di conferma -->
            {#if showModal}
                <div class="modal modal-open">
                    <div class="modal-box">
                        <h3 class="font-bold text-lg">Confirm Evaluation</h3>
                        <p class="py-4">
                            Are you sure you want to evaluate this paper as <strong>{evaluation}</strong>?
                        </p>
                        <div class="modal-action">
                            {#if $conference?.roles.includes(Role.Admin)}
                                <button class="btn btn-success" on:click={() => evaluation && submitEvaluationAdmin(evaluation)}>Confirm Evaluation</button>
                            {:else if $conference?.roles.includes(Role.Reviewer)}
                                <button class="btn btn-success" on:click={() => evaluation && submitEvaluationReviewer(evaluation)}>Confirm Review</button>
                            {/if}
                            <button class="btn btn-outline" on:click={() => { showModal = false; }}>Cancel</button>
                        </div>
                    </div>
                </div>
            {/if}

        
            <div class="divider">Revisori</div>
        
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Valutazione</th>
                            <th>Azione</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each reviewers as reviewer (reviewer.id)}
                            <tr>
                                <td>{reviewer.name}</td>
                                <td>{reviewer.email}</td>
                                <td>{reviewer.rating}</td>
                                <td>
                                    <button
                                        class="btn btn-error btn-sm"
                                        on:click={() => removeReviewer(reviewer.id)}
                                    >
                                        Rimuovi
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            {#if $conference?.roles.includes(Role.Admin)}
                <div class="form-control mt-6">
                    <label class="label" for="newReviewerEmail">
                        <span class="label-text">Aggiungi Revisore</span>
                    </label>
                    <div class="flex gap-4">
                        <input
                            type="email"
                            id="newReviewerEmail"
                            placeholder="Email revisore"
                            bind:value={newReviewerEmail}
                            class="input input-bordered flex-1"
                        />
                        <button class="btn btn-secondary" on:click={addReviewer}>
                            Aggiungi
                        </button>
                    </div>
                </div>
            {/if}
        
            <div class="divider">Commenti</div>
        
            <div class="form-control">
                <textarea
                    class="textarea textarea-bordered"
                    placeholder="Inserisci commenti qui..."
                    bind:value={comments}
                ></textarea>
            </div>
        </div>
    {:else if $conference?.roles.includes(Role.Author)}
        <div>
            inserisci la pagina per l'autore con il pulsante per caricare il paper se non presente o le info riguardo il paper inviato
        </div>
    <style>
        .divider {
            margin: 20px 0;
        }
    </style>
    {/if}
  </div>