document.addEventListener('DOMContentLoaded', function() {
    const blogListContainer = document.querySelector('.blog-list-container');
    const modal = document.getElementById('blog-modal');
    const modalContent = document.getElementById('modal-article-content');
    const closeBtn = document.querySelector('.close-btn');

    // URL de l'API WordPress pour la liste des articles
    const apiUrl = 'https://mosungi.org/blog/wp-json/wp/v2/posts';

    // Fonction pour créer un aperçu d'article de blog
    function createBlogPostElement(post) {
        const article = document.createElement('article');
        article.classList.add('blog-post');
        article.setAttribute('data-article-id', post.id);

        const date = new Date(post.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Utilise l'image en vedette si disponible, sinon une image par défaut
        const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : 'images/default-blog-image.jpg';

        article.innerHTML = `
            <img src="${featuredImage}" alt="${post.title.rendered}">
            <div class="post-content">
                <span class="blog-date">${formattedDate}</span>
                <h3 class="blog-title">${post.title.rendered}</h3>
                <p class="blog-excerpt">${post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                <button class="read-more-btn">Lire la suite <i class="fas fa-arrow-right"></i></button>
            </div>
        `;
        return article;
    }

    // Fonction pour afficher la liste des articles
    async function fetchAndDisplayPosts() {
        try {
            const response = await fetch(apiUrl + '?_embed');
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const posts = await response.json();
            blogListContainer.innerHTML = '';
            
            if (posts.length > 0) {
                posts.forEach(post => {
                    const postElement = createBlogPostElement(post);
                    blogListContainer.appendChild(postElement);
                });
            } else {
                blogListContainer.innerHTML = '<p>Aucun article de blog trouvé pour le moment.</p>';
            }

        } catch (error) {
            console.error('Erreur lors de la récupération des articles:', error);
            blogListContainer.innerHTML = '<p>Désolé, une erreur est survenue. Impossible de charger les articles du blog.</p>';
        }
    }

    // Fonction pour afficher le contenu complet de l'article dans la modale
    async function showArticleInModal(articleId) {
        try {
            const response = await fetch(`${apiUrl}/${articleId}?_embed`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const post = await response.json();

            // Nettoie et met à jour le contenu de la modale
            modalContent.innerHTML = '';

            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : 'images/default-blog-image.jpg';
            
            modalContent.innerHTML = `
                <img src="${featuredImage}" alt="${post.title.rendered}">
                <span class="blog-date">${formattedDate}</span>
                <h3 class="blog-title">${post.title.rendered}</h3>
                ${post.content.rendered}
            `;
            
            modal.style.display = 'block'; // Affiche la modale
            
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'article:', error);
            modalContent.innerHTML = '<p>Désolé, une erreur est survenue. Impossible de charger le contenu de l\'article.</p>';
            modal.style.display = 'block';
        }
    }

    // Gère le clic sur les boutons "Lire la suite" via la délégation d'événement
    blogListContainer.addEventListener('click', function(event) {
        const readMoreBtn = event.target.closest('.read-more-btn');
        if (readMoreBtn) {
            const article = readMoreBtn.closest('.blog-post');
            const articleId = article.getAttribute('data-article-id');
            showArticleInModal(articleId);
        }
    });

    // Événement pour fermer la modale
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Fermer la modale en cliquant en dehors
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Appelle la fonction pour charger la liste des articles au début
    fetchAndDisplayPosts();
});