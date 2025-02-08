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

    const notesFrancaises = ['mi', 'ré', 'do', 'si', 'la', 'sol', 'fa'];

    let cleActuelle = 'sol';

    const positionsNotesSol = {
        'mi': [60, 130],
        'ré': [70, 140],
        'do': [80, 150],
        'si': [90],
        'la': [100],
        'sol': [110, 40],
        'fa': [120, 50],
    };

    const positionsNotesFa = {
        'sol': [60, 130],
        'fa': [70, 140],
        'mi': [80],
        'ré': [90],
        'do': [100, 30],
        'si': [110, 40],
        'la': [120, 50],
    };

    function getRandomNote() {
        const randomIndex = Math.floor(Math.random() * notesFrancaises.length);
        return notesFrancaises[randomIndex];
    }

    function dessinerLignesPartition(ctx) {
        const lineHeight = 20;
        const startY = 50;
        ctx.strokeStyle = '#000';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(10, startY + i * lineHeight);
            ctx.lineTo(330, startY + i * lineHeight);
            ctx.stroke();
        }
    }

    function dessinerNote(ctx, note, positionX, couleur = '#000') {
        const positionsPossibles = cleActuelle === 'sol' ? positionsNotesSol[note] : positionsNotesFa[note];
        const randomIndexPosition = Math.floor(Math.random() * positionsPossibles.length);
        const randomPosition = positionsPossibles[randomIndexPosition];


        ctx.beginPath();
        ctx.arc(positionX, randomPosition + (50 - 50), 10, 0, Math.PI * 2, true);
        ctx.fillStyle = couleur;
        ctx.fill();
        ctx.stroke();

        return randomPosition;
    }

    function dessinerPlusieursNotes() {
        const canvas = document.getElementById('partition');
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dessinerLignesPartition(ctx);

        const nombreNotes = 5;
        const espaceEntreNotes = 60;
        let positionX = 50;

        notesADeviner = [];

        for (let i = 0; i < nombreNotes; i++) {
            let noteActuelle = getRandomNote();
            notesADeviner.push(noteActuelle);
            dessinerNote(ctx, noteActuelle, positionX);
            positionX += espaceEntreNotes;
        }

        console.log("Notes à deviner :", notesADeviner);
    }

    dessinerPlusieursNotes();

    let indexNoteCourante = 0;
    let compteurCorrectes = 0;
    let scoreMax = 0;

    function mettreAJourScoreMax() {
        if (compteurCorrectes > scoreMax) {
            scoreMax = compteurCorrectes;
            $('#scoreMax').text(scoreMax);
        }
    }

    function validerReponse(noteCliquee) {
        const canvas = document.getElementById('partition');
        const ctx = canvas.getContext('2d');

        if (noteCliquee === notesADeviner[indexNoteCourante]) {
            $('#resultat').text('Correct !');
            compteurCorrectes++;
            const positionY = 200;
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText(noteCliquee, 50 + (indexNoteCourante * 60) - 10, positionY - 15);
            indexNoteCourante++;

            if (indexNoteCourante === notesADeviner.length) {
                $('#resultat').text('Bravo, toutes les notes sont correctes !');
                indexNoteCourante = 0;
                setTimeout(function() {
                    dessinerPlusieursNotes();
                    mettreAJourScoreMax();
                }, 1000);
            }

        } else {
            $('#resultat').text('Faux ! La bonne note était ' + notesADeviner[indexNoteCourante]);

            const positionY = 200;
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText(notesADeviner[indexNoteCourante], 50 + (indexNoteCourante * 60) - 10, positionY - 15);
            compteurCorrectes = 0;
            indexNoteCourante = 0;
            setTimeout(function() {
                dessinerPlusieursNotes();
            }, 2000);
        }
        mettreAJourScoreMax();
    }

    $('#toggle').click(function () {
        if (cleActuelle === 'sol') {
            cleActuelle = 'fa';
            $('.note-btn').css({'background-color': '#6f42c1'});
            $('.toggleContainer').addClass('purple');
        } else {
            cleActuelle = 'sol';
            $('.note-btn').css({'background-color': '#17a2b8'});
            $('.toggleContainer').removeClass('purple');
        }
        dessinerPlusieursNotes();
    });

    $('.note-btn').click(function () {
        const noteCliquee = $(this).data('note');
        validerReponse(noteCliquee);
    });

    $('#generer').click(function () {
        dessinerPlusieursNotes();
    });
});
