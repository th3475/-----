// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getFirestore, addDoc, collection, serverTimestamp, 
    onSnapshot, query, orderBy, doc, updateDoc, increment, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = null;

// Вход пользователя
document.getElementById("loginBtn").addEventListener("click", () => {
    const email = prompt("Введите ваш Email");
    const name = prompt("Введите ваше имя");
    if (!email || !name) return alert("Email и имя обязательны!");
    currentUser = {email,name};
    alert(`Вы вошли как ${name}`);
});

// Отправка заявки
document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("username").value;
    const emailInput = document.getElementById("userEmail").value;
    const commentInput = document.getElementById("userComment").value;

    try {
        await addDoc(collection(db, "requests"), {
            name: nameInput,
            email: emailInput,
            comment: commentInput,
            likes: 0,
            timestamp: serverTimestamp()
        });
        alert("Заявка успешно отправлена!");
        document.getElementById("feedbackForm").reset();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка отправки.");
    }
});

// Лайк
window.processLike = async (id) => {
    const docRef = doc(db, "requests", id);
    await updateDoc(docRef, { likes: increment(1) });
};

// Удаление
window.deletePost = async (id, email) => {
    if (!currentUser || currentUser.email !== email) 
        return alert("Вы можете удалять только свои заявки!");
    if (!confirm("Удалить эту заявку?")) return;
    try {
        await deleteDoc(doc(db, "requests", id));
        alert("Заявка удалена!");
    } catch (error) {
        console.error("Ошибка удаления:", error);
        alert("Не удалось удалить заявку.");
    }
};

// Лента заявок
const q = query(collection(db, "requests"), orderBy("timestamp","desc"));
onSnapshot(q, (snapshot) => {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    snapshot.forEach((docItem) => {
        const data = docItem.data();
        feed.innerHTML += `
            <div class="post">
                <span class="time">${data.timestamp?.toDate().toLocaleString() || "..."}</span>
                <p><strong>${data.name}</strong></p>
                <p>${data.email}</p>
                <p style="margin-top:8px;">💬 ${data.comment || ""}</p>
                <button class="like-btn" onclick="processLike('${docItem.id}')">
                    👍 ${data.likes || 0}
                </button>
                <button class="delete-btn" onclick="deletePost('${docItem.id}','${data.email}')">
                    🗑
                </button>
            </div>
        `;
    });
});
