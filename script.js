$(document).ready(function () {

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then((registration) => {
                console.log('Service worker registered with scope:', registration.scope);
            }, (err) => {
            console.log('Service worker registration failed:', err);
            });
        });
    }

    // Les notes disponibles (en notation française pour la clé de sol sans le numéro d'octave)
    const notesFrancaises = ['mi', 'ré', 'do', 'si', 'la', 'sol', 'fa'];

    // Positions possibles pour chaque note sur la partition
    const positionsNotes = {
        'mi': [60, 130],  // Juste en dessous de la première ligne additionnelle
        'ré': [70, 140],  // Sur la première ligne
        'do': [80, 150],  // Premier interligne
        'si': [90],  // Sur la deuxième ligne
        'la': [100], // Deuxième interligne
        'sol': [110, 40],  // Sur la troisième ligne
        'fa': [120, 50],  // Troisième interligne (entre la troisième et la quatrième)
    };

    // Variable pour stocker les notes générées aléatoirement
    let notesADeviner = [];

    // Crée une note aléatoire
    function getRandomNote() {
        const randomIndex = Math.floor(Math.random() * notesFrancaises.length);
        return notesFrancaises[randomIndex];
    }

    // Dessine les lignes de la partition (sans clé de sol)
    function dessinerLignesPartition(ctx) {
        const lineHeight = 20;
        const startY = 50;  // Commencer les lignes à Y=50
        ctx.strokeStyle = '#000';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(10, startY + i * lineHeight);  // Lignes qui commencent à 50px
            ctx.lineTo(330, startY + i * lineHeight); // Elles s'étendent jusqu'à 550px
            ctx.stroke();
        }
    }

    // Dessine une note spécifique sur la partition
    function dessinerNote(ctx, note, positionX, couleur = '#000') {
        const positionsPossibles = positionsNotes[note];
        const randomIndexPosition = Math.floor(Math.random() * positionsPossibles.length);
        const randomPosition = positionsPossibles[randomIndexPosition];

        // Dessine la note (cercle) à la position spécifiée
        ctx.beginPath();
        ctx.arc(positionX, randomPosition + (50 - 50), 10, 0, Math.PI * 2, true);  // La note est décalée en X
        ctx.fillStyle = couleur;
        ctx.fill();
        ctx.stroke();

        return randomPosition; // Renvoie la position Y de la note
    }

    // Fonction pour dessiner plusieurs notes aléatoires
    function dessinerPlusieursNotes() {
        const canvas = document.getElementById('partition');
        const ctx = canvas.getContext('2d');

        // Efface la partition
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dessine les lignes de la partition
        dessinerLignesPartition(ctx);

        // Nombre de notes à dessiner
        const nombreNotes = 5;
        const espaceEntreNotes = 60;  // Espace entre chaque note
        let positionX = 50;  // Position initiale en X (pour la première note)

        // Réinitialise les notes à deviner
        notesADeviner = [];

        // Génère et dessine plusieurs notes aléatoires
        for (let i = 0; i < nombreNotes; i++) {
            let noteActuelle = getRandomNote();
            notesADeviner.push(noteActuelle);  // Sauvegarde la note générée
            dessinerNote(ctx, noteActuelle, positionX);
            positionX += espaceEntreNotes;  // Avancer la position pour la prochaine note
        }

        //console.log("Notes à deviner :", notesADeviner);
    }

    // Génére initialement plusieurs notes
    dessinerPlusieursNotes();

    // Variables pour le suivi des réponses
    let indexNoteCourante = 0;
    let compteurCorrectes = 0;
    let scoreMax = 0;

    // Met à jour le score maximum si le score courant le dépasse
    function mettreAJourScoreMax() {
        if (compteurCorrectes > scoreMax) {
            scoreMax = compteurCorrectes;
            $('#scoreMax').text('Score max : ' + scoreMax);
        }
    }

    // Fonction de validation
    function validerReponse(noteCliquee) {
        const canvas = document.getElementById('partition');
        const ctx = canvas.getContext('2d');

        // Vérifie si la note cliquée est correcte
        if (noteCliquee === notesADeviner[indexNoteCourante]) {
            $('#resultat').text('Correct !');
            compteurCorrectes++;  // Incrémenter le compteur si la réponse est correcte
            // Dessiner la note en vert et afficher son nom
            const positionY = 200;
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000'; // Utilise la couleur noire
            ctx.fillText(noteCliquee, 80 + (indexNoteCourante * 60) - 10, positionY - 15); // Positionne le texte au-dessus de la note (descendu un peu)
            indexNoteCourante++;  // Passer à la note suivante

            // Vérifie si toutes les notes ont été devinées
            if (indexNoteCourante === notesADeviner.length) {
                $('#resultat').text('Bravo, toutes les notes sont correctes !');
                //compteurCorrectes = 0;
                indexNoteCourante = 0;
                setTimeout(function() {
                    dessinerPlusieursNotes();
                    mettreAJourScoreMax();
                }, 2000);  // Générer une nouvelle série de notes
            }

        } else {
            $('#resultat').text('Faux ! La bonne note était ' + notesADeviner[indexNoteCourante]);

            // Dessiner la note en rouge et afficher son nom
            const positionY = 200;
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000'; // Utilise la couleur noire
            ctx.fillText(notesADeviner[indexNoteCourante], 100 + (indexNoteCourante * 80) - 10, positionY - 15); // Positionne le texte au-dessus de la note (descendu un peu)
            compteurCorrectes = 0;  // Réinitialiser le compteur si la réponse est fausse
            indexNoteCourante = 0;  // Recommencer depuis le début des notes
            setTimeout(function() {
                dessinerPlusieursNotes();
            }, 2000);  // Générer une nouvelle série de notes
        }

        // Mettre à jour l'affichage du compteur
        $('#compteur').text('Réponses correctes : ' + compteurCorrectes);

        // Met à jour le score maximum
        mettreAJourScoreMax();
    }

    // Gestion des clics sur les boutons de notes
    $('.note-btn').click(function () {
        const noteCliquee = $(this).data('note');
        validerReponse(noteCliquee);
    });

    // Générer de nouvelles notes en appuyant sur un bouton
    $('#generer').click(function () {
        dessinerPlusieursNotes();
    });
});
