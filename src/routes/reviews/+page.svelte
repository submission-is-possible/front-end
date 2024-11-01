<script lang="ts">
    interface Review {
        conferenceLink: string;
        conferenceName: string;
        paperTitle: string;
        score: number;
    }

    const reviews: Review[] = [
        {
            conferenceLink: "https://icml.cc/",
            conferenceName: "ICML 2024",
            paperTitle: "Deep Learning Approaches for Natural Language Processing in Low-Resource Languages",
            score: 8.5
        },
        {
            conferenceLink: "https://nips.cc/",
            conferenceName: "NeurIPS 2024",
            paperTitle: "A Novel Approach to Transformer Architecture for Computer Vision Tasks",
            score: 7.0
        },
        {
            conferenceLink: "https://aaai.org/",
            conferenceName: "AAAI 2024",
            paperTitle: "Reinforcement Learning in Multi-Agent Systems: A Comprehensive Study",
            score: 9.0
        }
    ];
</script>

<div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-6">My Paper Reviews</h1>
    
    <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
                    <th class="bg-base-200">Conference</th>
                    <th class="bg-base-200">Paper Title</th>
                    <th class="bg-base-200">Score</th>
                </tr>
            </thead>
            <tbody>
                {#each reviews as review}
                    <tr class="hover">
                        <td>
                            <a 
                                href={review.conferenceLink}
                                class="link link-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {review.conferenceName}
                            </a>
                        </td>
                        <td>{review.paperTitle}</td>
                        <td>
                            <div class="badge {review.score >= 8 ? 'badge-success' : 
                                          review.score >= 6 ? 'badge-warning' : 
                                          'badge-error'}">
                                {review.score}
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>