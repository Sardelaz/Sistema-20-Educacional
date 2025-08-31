// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdvqFpKHpguqUcnkreu5nYotqtdDzzHY4",
    authDomain: "evolucao-educacional.firebaseapp.com",
    projectId: "evolucao-educacional",
    storageBucket: "evolucao-educacional.appspot.com",
    messagingSenderId: "841004951746",
    appId: "1:841004951746:web:44a6f884840b35f415335b"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos da UI
const loadingIndicator = document.querySelector('.loading-indicator');
const rankingList = document.getElementById('ranking-list');
const titleEl = document.getElementById('ranking-title');
const userPositionEl = document.getElementById('user-position');
const userLeagueEl = document.getElementById('user-league');
const tabButtons = document.querySelectorAll('.tab-btn');

let currentUserId = null;

// Mapeamento dos tipos de ranking para os campos do Firestore
const rankingFields = {
    league: { field: 'weeklyXp', suffix: ' XP', color: 'var(--cor-xp)' },
    lessonsCompleted: { field: 'lessonsCompleted', suffix: ' Aulas', color: 'var(--cor-lessons)' },
    accuracy: { field: 'accuracyRate', suffix: '%', color: 'var(--cor-accuracy)' },
    simulation: { field: 'simulationScore', suffix: ' pts', color: 'var(--cor-simulation)' },
    redaction: { field: 'bestRedactionScore', suffix: ' pts', color: 'var(--cor-redaction)' }
};

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid;
            loadRankingData('league'); 
        } else {
            window.location.href = '../index.html';
        }
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const rankingType = button.dataset.rankingType;
            loadRankingData(rankingType);
        });
    });
});

async function loadRankingData(rankingType) {
    loadingIndicator.style.display = 'block';
    rankingList.innerHTML = '';
    userPositionEl.textContent = '';
    userLeagueEl.textContent = '';

    try {
        const userRef = db.collection('users').doc(currentUserId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) throw new Error("Perfil do utilizador não encontrado.");
        
        const currentUserData = userDoc.data();
        const userLeague = currentUserData.league || 'Bronze';
        titleEl.textContent = `Liga ${userLeague}`;
        userLeagueEl.textContent = `Divisão ${userLeague}`;

        const activeTab = document.querySelector(`.tab-btn.active`);
        document.querySelectorAll('.tab-btn').forEach(b => {
             b.style.backgroundColor = 'transparent';
             b.style.borderColor = 'var(--cor-borda)';
        });
        if (activeTab) {
            activeTab.style.backgroundColor = rankingFields[rankingType].color;
            activeTab.style.borderColor = rankingFields[rankingType].color;
        }
        
        const { field, suffix, color } = rankingFields[rankingType];
        
        let query;
        if (rankingType === 'league') {
             query = db.collection('users').where('league', '==', userLeague).orderBy('weeklyXp', 'desc');
        } else if (rankingType === 'accuracy') {
            const accuracyRate = currentUserData.totalAnswers > 0 ? (currentUserData.correctAnswers / currentUserData.totalAnswers) * 100 : 0;
            if (currentUserData.accuracyRate !== parseFloat(accuracyRate.toFixed(2))) {
                await userRef.update({ accuracyRate: parseFloat(accuracyRate.toFixed(2)) });
            }
            query = db.collection('users').orderBy(field, 'desc').limit(100);
        } else {
            query = db.collection('users').orderBy(field, 'desc').limit(100);
        }
        
        const querySnapshot = await query.get();
        const allUsers = [];
        querySnapshot.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));

        let position = 1;
        allUsers.forEach(userData => {
            const isCurrentUser = userData.id === currentUserId;
            if (isCurrentUser) {
                userPositionEl.textContent = `Sua Posição: ${position}º`;
            }

            const li = document.createElement('li');
            li.className = 'ranking-item';
            if (isCurrentUser) li.classList.add('user-highlight');

            let score = userData[field] || 0;
            if (rankingType === 'accuracy') {
                 score = score.toFixed(1);
            }

            li.innerHTML = `
                <div class="ranking-info">
                    <span class="ranking-position">${position}</span>
                    <img src="${userData.photoURL || 'https://i.pravatar.cc/40'}" alt="Foto" class="user-photo">
                    <span class="ranking-name">${userData.displayName}</span>
                </div>
                <span class="ranking-score" style="color: ${color}">${score}${suffix}</span>
            `;
            rankingList.appendChild(li);
            position++;
        });

    } catch (error) {
        console.error("Erro ao carregar o ranking:", error);
        rankingList.innerHTML = `<li>Ocorreu um erro: ${error.message}</li>`;
        if (error.code === 'failed-precondition') {
            rankingList.innerHTML += '<li><strong>Ação necessária:</strong> Esta consulta requer um índice no Firestore. Verifique a consola de programador (F12) para o link de criação.</li>';
        }
    } finally {
        loadingIndicator.style.display = 'none';
    }
}