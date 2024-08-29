        let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
        let currentUser = null;
        let currentPhoto = "";
        let currentGroup = null;
        let groupes = JSON.parse(localStorage.getItem("groupes")) || [];
        let resetCode = null;

        function showLoginForm() {
            document.getElementById("loginForm").classList.remove("hidden");
            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("forgotPasswordForm").classList.add("hidden");
            document.getElementById("groupSection").classList.add("hidden");
            document.getElementById("socialSection").classList.add("hidden");
        }

        function showRegisterForm() {
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("registerForm").classList.remove("hidden");
            document.getElementById("forgotPasswordForm").classList.add("hidden");
            document.getElementById("groupSection").classList.add("hidden");
            document.getElementById("socialSection").classList.add("hidden");
        }

        function showForgotPasswordForm() {
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("forgotPasswordForm").classList.remove("hidden");
            document.getElementById("groupSection").classList.add("hidden");
            document.getElementById("socialSection").classList.add("hidden");
        }

        function sendResetCode() {
            const email = document.getElementById("forgotEmail").value;
            const user = utilisateurs.find(u => u.email === email);
            if (user) {
                resetCode = Math.floor(100000 + Math.random() * 900000); // Générer un code aléatoire à 6 chiffres
                alert(`Code de réinitialisation envoyé : ${resetCode}`);
                document.getElementById("resetCodeSection").classList.remove("hidden");
            } else {
                alert("Email non trouvé !");
            }
        }

        function resetPassword() {
            const code = document.getElementById("resetCode").value;
            const newPassword = document.getElementById("newPassword").value;
            const email = document.getElementById("forgotEmail").value;
            if (parseInt(code) === resetCode) {
                const user = utilisateurs.find(u => u.email === email);
                if (user) {
                    user.password = newPassword;
                    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
                    alert("Mot de passe réinitialisé avec succès !");
                    showLoginForm();
                }
            } else {
                alert("Code invalide !");
            }
        }

        function login() {
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            const user = utilisateurs.find(u => u.email === email && u.password === password);
            if (user) {
                alert("connection établie")
                currentUser = user;
                document.getElementById("currentUser").textContent = user.nom;
                document.getElementById("loginForm").classList.add("hidden");
                document.getElementById("registerForm").classList.add("hidden");
                document.getElementById("forgotPasswordForm").classList.add("hidden");
                document.getElementById("groupSection").classList.remove("hidden");
                document.getElementById("socialSection").classList.add("hidden");
                window.location.replace="home.html";
                afficherGroupes();
            } else {
                alert("Email ou mot de passe incorrect !");
            }
        }

        function register() {
            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            if (utilisateurs.find(u => u.email === email)) {
                alert("L'email est déjà utilisé !");
                return;
            }
            utilisateurs.push({ nom: name, email: email, password: password });
            localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
            alert("Inscription réussie !");
            showLoginForm();
        }

        function logout() {
            currentUser = null;
            document.getElementById("groupSection").classList.add("hidden");
            document.getElementById("socialSection").classList.add("hidden");
            showLoginForm();
        }

        function toggleGroupMenu() {
            const menu = document.getElementById("groupMenu");
            menu.classList.toggle("hidden");
        }

        function showCreateGroupForm() {
            document.getElementById("createGroupForm").classList.remove("hidden");
            document.getElementById("joinGroupForm").classList.add("hidden");
        }

        function showJoinGroupForm() {
            document.getElementById("createGroupForm").classList.add("hidden");
            document.getElementById("joinGroupForm").classList.remove("hidden");
        }

        function creerGroupe() {
            const groupName = document.getElementById("groupName").value;
            if (groupes.find(g => g.nom === groupName)) {
                alert("Groupe déjà existant !");
                return;
            }
            groupes.push({ nom: groupName, membres: [currentUser.email], publications: [] });
            localStorage.setItem("groupes", JSON.stringify(groupes));
            alert("Groupe créé avec succès !");
            afficherGroupes();
        }

        function rejoindreGroupe() {
            const code = document.getElementById("groupCode").value;
            const groupe = groupes.find(g => g.nom === code);
            if (groupe) {
                if (groupe.membres.includes(currentUser.email)) {
                    alert("Vous êtes déjà membre de ce groupe !");
                    return;
                }
                groupe.membres.push(currentUser.email);
                localStorage.setItem("groupes", JSON.stringify(groupes));
                alert("Vous avez rejoint le groupe !");
                afficherGroupes();
            } else {
                alert("Groupe non trouvé !");
            }
        }

        function afficherGroupes() {
            const groupsList = document.getElementById("groupsList");
            groupsList.innerHTML = "";
            groupes.forEach(group => {
                if (group.membres.includes(currentUser.email)) {
                    const groupDiv = document.createElement("div");
                    groupDiv.className = "group";
                    groupDiv.innerHTML = `
                        <h3>${group.nom}</h3>
                        <p>Membres : ${group.membres.join(", ")}</p>
                        <button onclick="enterGroup('${group.nom}')">Voir le groupe</button>
                    `;
                    groupsList.appendChild(groupDiv);
                }
            });
        }

        function enterGroup(groupName) {
            currentGroup = groupes.find(g => g.nom === groupName);
            if (!currentGroup) {
                alert("Groupe non trouvé !");
                return;
            }
            document.getElementById("groupTitle").textContent = currentGroup.nom;
            document.getElementById("groupSection").classList.add("hidden");
            document.getElementById("socialSection").classList.remove("hidden");
            afficherPublications();
        }

        function previewPhoto() {
            const file = document.getElementById("photoInput").files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                document.getElementById("photoPreview").src = reader.result;
                document.getElementById("photoPreview").classList.remove("hidden");
            };
            if (file) {
                reader.readAsDataURL(file);
                currentPhoto = file;
            } else {
                document.getElementById("photoPreview").classList.add("hidden");
            }
        }

        function publier() {
            if (!currentPhoto) {
                alert("Aucune photo sélectionnée !");
                return;
            }
            const publication = {
                photo: URL.createObjectURL(currentPhoto),
                notes: []
            };
            currentGroup.publications.push(publication);
            localStorage.setItem("groupes", JSON.stringify(groupes));
            alert("Publication réussie !");
            afficherPublications();
        }

        function afficherPublications() {
            const notationSection = document.getElementById("notationSection");
            notationSection.innerHTML = "";
            currentGroup.publications.forEach((pub, index) => {
                const pubDiv = document.createElement("div");
                pubDiv.className = "publication";
                pubDiv.innerHTML = `
                    <img src="${pub.photo}" class="photo-preview">
                    <label for="note_${index}">Note :</label>
                    <input type="number" id="note_${index}" min="1" max="5">
                `;
                notationSection.appendChild(pubDiv);
            });
        }

        function soumettreNotes() {
            currentGroup.publications.forEach((pub, index) => {
                const note = parseInt(document.getElementById(`note_${index}`).value, 10);
                if (!isNaN(note)) {
                    pub.notes.push(note);
                }
            });
            localStorage.setItem("groupes", JSON.stringify(groupes));
            alert("Notes soumises !");
        }

        function choisirAdmin() {
            const meilleursNotes = currentGroup.publications.flatMap(pub => pub.notes).filter(note => note);
            if (meilleursNotes.length === 0) {
                alert("Aucune note disponible !");
                return;
            }
            const moyenneNotes = meilleursNotes.reduce((acc, note) => acc + note, 0) / meilleursNotes.length;
            const admin = currentGroup.membres.find((membre, index) => {
                const notes = currentGroup.publications.flatMap(pub => pub.notes);
                return notes.some(note => note >= moyenneNotes);
            });
            document.getElementById("adminMessage").textContent = admin ? `L'administrateur est : ${admin}` : "Aucun administrateur trouvé.";
        }

        function retourGroupes() {
            document.getElementById("groupSection").classList.remove("hidden");
            document.getElementById("socialSection").classList.add("hidden");
        }
