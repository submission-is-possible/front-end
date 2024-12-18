<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { paper, setPaper } from '$stores/paperStore';
  import { user } from '$stores/userStore';
  import { conference } from '$stores/conferenceStore'
  import {Role} from '$lib/models/role';
  import { Paper, goToPaperDetail } from '$lib/models/paper';
  import { get } from 'svelte/store';
  //import type { ConferenceFormData } from '$lib/types';
  import { Conference } from '$lib/models/conference';
  export let data: PageData;
  import { writable } from 'svelte/store';
  import ReviewItem from '$lib/components/ReviewItem.svelte';
  import { ReviewTemplateItem } from '$lib/models/reviewItemData';
    import CommentSection from '$lib/components/CommentSection.svelte';
    import { Comment } from '$lib/models/comments';


    let isLoading = true;
    let error: string | null = null;
    let reviewText = '';
    let isSubmitting = false;
    let currentUserId: number | null = null;
    let creatorId: number | null = null;
    let adminData: any = null; 
    let isAuthor = false;

    async function openPaperOnLinkClicked(paper: Paper) {
        window.open(`http://localhost:8000/papers/paper${paper.paper_file}`, '_blank', 'noopener'); 
    }

    onMount(() => {
        console.log($conference?.reviewTemplate)
        //controlla i ruoli dell'utente e prendi le info necessarie
        try{
            currentPaper = $paper;
            if($paper?.role.includes(Role.Admin)){
                fetchReviewData();
                fetchPaperReviews();
            }
            if($paper?.role.includes(Role.Author)){
                fetchPaperReviews();
            }
            if($paper?.role.includes(Role.Reviewer)){
                fetchReviewData();
                hasBeenReviewed();
                fetchReview();
            }
        } catch (err) {
            error = 'Error loading conference details';
            console.error('Error in onMount:', err);
        } finally {
            isLoading = false;
        }
    });


    let been_reviewed = false;

    async function hasBeenReviewed() {
        try {
            const response = await fetch(`http://localhost:8000/reviews/hasbeenreviewed/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paper_id: $paper?.id,
                    user_id: $user?.id,
                }),
                }
            );

            if (!response.ok) {
                throw new Error("Errore nella richiesta.");
            }
            const data = await response.json();
            been_reviewed= data.has_been_reviewed;
          } catch (error) {
            console.error('Errore nel recupero dei revisori:', error);
        }
    }



    let reviewers: { id: number; first_name: string; last_name: string; email: string}[] = []; // Lista dei revisori
    let newReviewerEmail = ''; // Email del nuovo revisore da aggiungere
    let comments = ''; // Area per commenti (placeholder per futura implementazione)

    // Mock paper e revisori (da sostituire con dati reali)
    let currentPaper: Paper | null = null;

    async function fetchReviewData() {
        try {
            const response = await fetch(
                `http://localhost:8000/assign_paper_reviewers/get_reviewers/paper/${$paper?.id}/conference/${$conference?.id}`, 
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Il paper o i revisori non sono stati trovati.");
                }
                if (response.status === 403) {
                    throw new Error("Non sei autorizzato a vedere i revisori.");
                }
                throw new Error("Errore nella richiesta.");
            }

            const data = await response.json();
            console.log('Revisori:', data.reviewers);
            reviewers = data.reviewers;     //SE L'AUTORE E' REVISORE, NON PUò MODIFICARE I DATI
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
            const response = await fetch('http://localhost:8000/assign_paper_reviewers/assign_reviewer_to_paper/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paper_id: $paper.id,
                    reviewer_email: newReviewerEmail,
                    current_user_id: $user?.id,
                    conference_id: $conference?.id,
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
            fetchReviewData();
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
            const response = await fetch('http://localhost:8000/assign_paper_reviewers/remove_reviewer_from_paper/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_user_id: $user?.id,
                    conference_id: $conference?.id,
                    paper_id: $paper.id,
                    reviewer_email: reviewerToRemove.email,
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
    let score: number = 0;
    let confidence: number = 0; 
    let showModal = false; // Controlla la visibilità del modale
    const eventDispatcher = createEventDispatcher(); // Per comunicare con il componente genitore


    async function submitEvaluationReviewer(score : number, confidence : number) {
        console.log($conference?.reviewTemplate)
        try {
            const response = await fetch('http://localhost:8000/reviews/create_review/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Necessario per includere il cookie CSRF, se richiesto
                body: JSON.stringify({
                    paper_id: $paper?.id,
                    comment_text: reviewText,
                    score: score,
                    confidence_level: confidence,
                    reviewItemList: $conference?.reviewTemplate
                }),
            });

            if (!response.ok) {
                // Gestione degli errori
                if (response.status === 403) {
                    throw new Error('Non sei autorizzato a modificare questa review.');
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
            alert('Lo stato della review è stato aggiornato con successo!');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento:', error);
            if (error instanceof Error) {
                alert(error.message || 'Errore durante l\'aggiornamento dello stato della review.');
            } else {
                alert('Errore durante l\'aggiornamento dello stato della review.');
            }
        } finally {
            showModal = false; // Nascondi il modale
        }
    }

    async function submitEvaluationAdmin(evaluation : string) {
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
                    user_id: $user?.id,
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






 

    


   


    let paperReviews: {
        id: number; 
        name: string; 
        surname: string; 
        evaluation: number;
        confidence: number;
        comment: string;
        comments: Comment[];
        reviewItems: ReviewTemplateItem[]
    }[] = []; // Lista dei revisori
    
    export async function fetchPaperReviews() {
        try {
            const response = await fetch(`http://localhost:8000/reviews/get_paper_reviews/?paper_id=${$paper?.id}&page=${1}&page_size=${50}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include i cookie per autenticazione, se necessario
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error("Richiesta non valida. Assicurati di aver specificato un ID paper corretto.");
                }
                if (response.status === 405) {
                    throw new Error("Metodo non permesso. Verifica che la richiesta sia GET.");
                }
                throw new Error("Errore durante la richiesta.");
            }

            const data = await response.json();
            console.log("recensioni");

            paperReviews = data.reviews.map((review: any) => ({
                id:review.id,
                name: review.user.first_name,
                surname: review.user.last_name,
                evaluation: review.score,
                confidence: review.confidence_level,
                comment: review.comment_text,
                reviewItems: review.reviewItems,
                comments: review.comments
            }));

            console.log("Recensioni caricate con successo:", data);
        } catch (error) {
            console.error("Errore durante il caricamento delle recensioni:", error);
        }
    }

    async function fetchReview(){
        try {
            const response = await fetch(`http://localhost:8000/reviews/${$paper?.id}/get_review/?page=${1}&page_size=${50}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include i cookie per autenticazione, se necessario
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error("Richiesta non valida. Assicurati di aver specificato un ID paper corretto.");
                }
                if (response.status === 405) {
                    throw new Error("Metodo non permesso. Verifica che la richiesta sia GET.");
                }
                throw new Error("Errore durante la richiesta.");
            }

            const data = await response.json();
            console.log("recensioni");

            paperReviews = data.reviews.map((review: any) => ({
                id:review.id,
                name: review.user.first_name,
                surname: review.user.last_name,
                evaluation: review.score,
                confidence: review.confidence_level,
                comment: review.comment_text,
                reviewItems: review.reviewItems,
                comments: review.comments
            }));

            console.log("Recensioni caricate con successo:", data);
        } catch (error) {
            console.error("Errore durante il caricamento delle recensioni:", error);
        }
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
    {:else}
        <div class="p-6 bg-base-200 rounded-lg shadow-md">
            {#if currentPaper}
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-primary">{currentPaper.title}</h1>
                    <p class="text-sm text-gray-500"><strong>Autore:</strong> {currentPaper.author}</p>
                    <button
                        class="btn btn-primary mt-4"
                        on:click={() => currentPaper && openPaperOnLinkClicked(currentPaper)}
                    >
                        Scarica Paper
                    </button>
                </div>
            {:else}
                <div class="alert alert-warning">
                    <span>Caricamento dettagli del paper...</span>
                </div>
            {/if}

            {#if $paper?.role.includes(Role.Admin)}
            <div class="divider">Chair Evaluation</div>
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
            {:else if $paper?.role.includes(Role.Reviewer)}
                {#if !been_reviewed}
                    <div class="flex flex-col items-center space-y-4 mt-4">
                        <div class="divider">Overall Evaluation</div>
                        <!-- Label -->
                        <label for="score" class="font-semibold">Overall score (0-5):</label>

                        <!-- Visualizzazione del punteggio selezionato -->
                        <p class="font-bold">Selected Score: {score}</p>

                        <!-- Barra di selezione -->
                        <input
                        type="range"
                        id="score"
                        min="0"
                        max="5"
                        step="1"
                        class="range range-primary w-64"
                        bind:value={score}
                        />

                        

                        <!-- Label -->
                        <label for="confidence" class="font-semibold">Reviewer Confidence (0-5):</label>

                        <!-- Visualizzazione del punteggio selezionato -->
                        <p class="font-bold">Selected Confidence level: {confidence}</p>
                        
                        <!-- Barra di selezione -->
                        <input
                        type="range"
                        id="confidence"
                        min="0"
                        max="5"
                        step="1"
                        class="range range-primary w-64"
                        bind:value={confidence}
                        />


                        <!-- Recensione scritta -->
                        <div class="form-control w-full max-w-md">
                            <label class="label" for="reviewText">
                                <span class="label-text font-semibold">Write your review</span>
                            </label>
                            <textarea
                                id="reviewText"
                                class="textarea textarea-bordered h-24"
                                placeholder="Enter your review here"
                                bind:value={reviewText}>
                            </textarea>
                        </div>
                        {#each $conference?.reviewTemplate || [] as reviewTemplateItem} 
                            <ReviewItem templateItem = {reviewTemplateItem} />
                        {/each}
                        
                    </div>

                    <!-- Pulsante di conferma -->
                    <div class="flex flex-col items-center space-y-4 mt-4">
                        <button
                        class="btn btn-outline btn-primary"
                        on:click={() => { showModal = true; }}>
                        Submit Score
                        </button>
                    </div>                

                {:else}
                <div class="alert alert-warning mb-8">
                    <span>You have already reviewed this paper</span>

                </div>
                {/if}
            {/if}
            

            
            <!-- Modale di conferma -->
            {#if showModal}
                <div class="modal modal-open">
                    <div class="modal-box">
                        <h3 class="font-bold text-lg">Confirm Evaluation</h3>
                        <p class="py-4">
                            Are you sure you want to evaluate this paper with an overall score of <strong>{score}</strong>?
                        </p>
                        <div class="modal-action">
                            {#if $paper?.role.includes(Role.Admin)}
                                <button class="btn btn-success" on:click={() => evaluation && submitEvaluationAdmin(evaluation)}>Confirm Evaluation</button>
                            {:else if $paper?.role.includes(Role.Reviewer)}
                                <button class="btn btn-success" on:click={() => score && confidence && submitEvaluationReviewer(score, confidence)}>Confirm Review</button>
                            {/if}
                            <button class="btn btn-outline" on:click={() => { showModal = false; }}>Cancel</button>
                        </div>
                    </div>
                </div>
            {/if}

            {#if $paper?.role.includes(Role.Admin)}
                <div class="divider">Reviewer</div>
            
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Surname</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each reviewers as reviewer (reviewer.id)}
                                <tr>
                                    <td>{reviewer.first_name}</td>
                                    <td>{reviewer.last_name}</td>
                                    <td>{reviewer.email}</td>
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
                            Add
                        </button>
                    </div>
                </div>
        
            <div class="divider">reviews</div>
        {/if}
        <div class="reviews-container space-y-6">
            {#each paperReviews as review, index}
                <!-- Card della recensione -->
                <div class="card bg-base-100 shadow-md border border-base-300">
                    <div class="card-body">
                        <!-- Riga superiore: Nome, Cognome, Valutazione -->
                        <div class="flex justify-between items-center">
                            <div class="text-lg font-semibold">
                                {review.name} {review.surname}
                            </div>
                            <div class="badge badge-primary badge-outline">
                                Confidence: {review.confidence}/5
                            </div>
                            <div class="badge badge-primary badge-outline">
                                Overall score: {review.evaluation}/5
                            </div>
                        </div>
        
                        <!-- Blocco commento -->
                        <p class="mt-4 text-base text-gray-700">
                            {review.comment}
                        </p>

                        {#each review.reviewItems as reviewItem}
                            <ReviewItem templateItem={reviewItem} editable = {false}/>
                        {/each}
                        {#if $paper?.role.includes(Role.Reviewer) || $paper?.role.includes(Role.Admin)}
                            <CommentSection comments={review.comments} review_id={review.id}/>
                        {/if}
                    </div>
                </div>
        
                <!-- Separatore tra recensioni -->
                {#if index < paperReviews.length - 1}
                    <div class="divider"></div>
                {/if}
            {/each}
        </div>

    </div>

    <style>
        .divider {
            margin: 20px 0;
        }
    </style>
    {/if}
  </div>