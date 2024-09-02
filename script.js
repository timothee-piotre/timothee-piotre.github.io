        let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
        let groupes = JSON.parse(localStorage.getItem("groupes")) || [];
        let currentUser = null;
        let currentGroup = null;
        let currentPhotoIndex = 0;

        function showLoginForm() {
            document.getElementById("loginForm").classList.remove("hidden");
            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("forgotPasswordForm").classList.add("hidden");
            document.getElementById("resetCodeSection").classList.add("hidden");
            document.getElementById("userInterface").classList.add("hidden");
            document.getElementById("createGroupForm").classList.add("hidden");
            document.getElementById("joinGroupForm").classList.add("hidden");
            document.getElementById("groupPage").classList.add("hidden");
        }

        function showRegisterForm() {
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("registerForm").classList.remove("hidden");
        }

        function showForgotPasswordForm() {
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("forgotPasswordForm").classList.remove("hidden");
        }

        function showUserInterface() {
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("forgotPasswordForm").classList.add("hidden");
            document.getElementById("resetCodeSection").classList.add("hidden");
            document.getElementById("userInterface").classList.remove("hidden");
            document.getElementById("createGroupForm").classList.add("hidden");
            document.getElementById("joinGroupForm").classList.add("hidden");
            document.getElementById("groupPage").classList.add("hidden");
            updateGroupList();
        }

        function showCreateGroupForm() {
            window.location.href='newgroup.html';
            document.getElementById("createGroupForm").classList.remove("hidden");
        }

        function showJoinGroupForm() {
            document.getElementById("userInterface").classList.add("hidden");
            document.getElementById("joinGroupForm").classList.remove("hidden");
        }

        function showGroupPage(groupCode) {
            const group = groupes.find(g => g.code === groupCode);
            if (group) {
                document.getElementById("userInterface").classList.add("hidden");
                document.getElementById("createGroupForm").classList.add("hidden");
                document.getElementById("joinGroupForm").classList.add("hidden");
                document.getElementById("groupPage").classList.remove("hidden");

                document.getElementById("groupNameDisplay").textContent = group.name;
                currentGroup = group;
                displayPhotos();
            }
        }

        function register() {
            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const code = Math.random().toString(36).substring(2, 12);

            if (utilisateurs.find(u => u.email === email)) {
                alert("L'email est déjà utilisé !");
                return;
            }

            const user = { nom: name, email: email, password: password, resetCode: code, points: 0, groupes: [] };
            utilisateurs.push(user);
            localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

            // Génération du fichier de code
            const codeBlob = new Blob([code], { type: 'text/plain' });
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(codeBlob);
            downloadLink.download = 'reset_code.txt';
            downloadLink.click();

            alert("Inscription réussie ! Code de réinitialisation téléchargé.");
            showLoginForm();
        }

        function login() {
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            const user = utilisateurs.find(u => u.email === email && u.password === password);
            if (user) {
                alert("connection établie")
                window.location.href="home.html";
                res.redirect("/home.html");
                currentUser = user;
                document.getElementById("currentUser").textContent = user.nom;
                document.getElementById("loginForm").classList.add("hidden");
                document.getElementById("registerForm").classList.add("hidden");
                document.getElementById("forgotPasswordForm").classList.add("hidden");
                document.getElementById("groupSection").classList.remove("hidden");
                document.getElementById("socialSection").classList.add("hidden");
                afficherGroupes();
            } else {
                alert("Email ou mot de passe incorrect !");
            }
        }
        function sendResetCode() {
            const email = document.getElementById("forgotEmail").value;
            const user = utilisateurs.find(u => u.email === email);
            if (user) {
                document.getElementById("resetCodeSection").classList.remove("hidden");
            } else {
                alert("Email non trouvé !");
            }
        }

        function resetPassword() {
            const resetCode = document.getElementById("resetCode").value;
            const newPassword = document.getElementById("newPassword").value;
            const email = document.getElementById("forgotEmail").value;

            const user = utilisateurs.find(u => u.email === email && u.resetCode === resetCode);
            if (user) {
                user.password = newPassword;
                localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
                alert("Mot de passe réinitialisé avec succès !");
                showLoginForm();
            } else {
                alert("Code invalide !");
            }
        }

        function createGroup() {
            const name = document.getElementById("groupName").value;
            const code = document.getElementById("groupCode").value;

            if (groupes.find(g => g.code === code)) {
                alert("Un groupe avec ce code existe déjà !");
                return;
            }

            const group = { name: name, code: code, members: [currentUser.email], photos: [], scores: {} };
            groupes.push(group);
            localStorage.setItem("groupes", JSON.stringify(groupes));

            // Ajouter l'utilisateur au groupe
            currentUser.groupes.push(code);
            localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

            alert("Groupe créé avec succès !");
            windows.location.href="group.html";
            document.getElementById("groupList").classList.remove("hidden");
        }
        function buttongotoregister() {
                windows.location.href="register.html"
        }

        function buttongotologin() {
                windows;location.href="login.html"
        }

        function joinGroup() {
            const code = document.getElementById("joinGroupCode").value;
            const group = groupes.find(g => g.code === code);

            if (group) {
                if (!currentUser.groupes.includes(code)) {
                    currentUser.groupes.push(code);
                    group.members.push(currentUser.email);
                    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
                    localStorage.setItem("groupes", JSON.stringify(groupes));
                    alert("Vous avez rejoint le groupe !");
                    showUserInterface();
                } else {
                    alert("Vous êtes déjà membre de ce groupe !");
                }
            } else {
                alert("Groupe non trouvé !");
            }
        }

        function uploadPhoto() {
            const fileInput = document.getElementById("photoFile");
            if (fileInput.files.length === 0) {
                alert("Veuillez sélectionner une photo !");
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const photo = { url: event.target.result, votes: [], author: currentUser.email };

                if (currentGroup) {
                    currentGroup.photos.push(photo);
                    localStorage.setItem("groupes", JSON.stringify(groupes));
                    displayPhotos();
                }
            };
            reader.readAsDataURL(file);
        }

        function displayPhotos() {
            const photoList = document.getElementById("photoList");
            photoList.innerHTML = '';

            if (currentGroup && currentGroup.photos.length > 0) {
                currentGroup.photos.forEach((photo, index) => {
                    const photoContainer = document.createElement("div");
                    photoContainer.className = "photo-container";
                    
                    const img = document.createElement("img");
                    img.src = photo.url;
                    photoContainer.appendChild(img);

                    // Boutons de navigation
                    const prevButton = document.createElement("button");
                    prevButton.className = "navigation-button prev-button";
                    prevButton.innerHTML = "&#9664;"; // Flèche gauche
                    prevButton.onclick = () => showPhoto(index - 1);
                    photoContainer.appendChild(prevButton);

                    const nextButton = document.createElement("button");
                    nextButton.className = "navigation-button next-button";
                    nextButton.innerHTML = "&#9654;"; // Flèche droite
                    nextButton.onclick = () => showPhoto(index + 1);
                    photoContainer.appendChild(nextButton);

                    // Menu déroulant pour deviner l'auteur
                    const authorSelect = document.createElement("select");
                    currentGroup.members.forEach(member => {
                        const option = document.createElement("option");
                        option.value = member;
                        option.textContent = member;
                        authorSelect.appendChild(option);
                    });
                    photoContainer.appendChild(authorSelect);

                    // Bouton de notation
                    const rateButton = document.createElement("button");
                    rateButton.textContent = "Noter";
                    rateButton.onclick = () => ratePhoto(index, authorSelect.value);
                    photoContainer.appendChild(rateButton);

                    photoList.appendChild(photoContainer);
                });

                showPhoto(0); // Afficher la première photo
            }
        }

        function showPhoto(index) {
            if (currentGroup && currentGroup.photos.length > 0) {
                currentPhotoIndex = (index + currentGroup.photos.length) % currentGroup.photos.length;
                const photoContainers = document.querySelectorAll(".photo-container");
                photoContainers.forEach((container, idx) => {
                    container.style.display = (idx === currentPhotoIndex) ? "block" : "none";
                });
            }
        }

        function ratePhoto(index, author) {
            const rating = prompt("Donnez une note (1-5) :");
            const ratingValue = parseInt(rating);

            if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                alert("Note invalide !");
                return;
            }

            if (currentGroup) {
                const photo = currentGroup.photos[index];
                photo.votes.push({ rating: ratingValue, voter: currentUser.email });

                // Mettre à jour les points de l'auteur
                const authorUser = utilisateurs.find(u => u.email === author);
                if (authorUser) {
                    authorUser.points += ratingValue;
                    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
                    document.getElementById("userPoints").textContent = authorUser.points;
                }

                // Recalculer les scores des utilisateurs du groupe
                calculateScores();
                alert("Photo notée avec succès !");
            }
        }

        function updateGroupList() {
            const groupList = document.getElementById("groupList");
            groupList.innerHTML = '';

            if (currentUser) {
                const userGroups = groupes.filter(g => currentUser.groupes.includes(g.code));
                userGroups.forEach(group => {
                    const groupCard = document.createElement("div");
                    groupCard.className = "group-card";

                    const groupName = document.createElement("h3");
                    groupName.textContent = group.name;
                    groupCard.appendChild(groupName);

                    const groupPoints = document.createElement("p");
                    groupPoints.textContent = `Points: ${group.members.reduce((sum, member) => {
                        const user = utilisateurs.find(u => u.email === member);
                        return sum + (user ? user.points : 0);
                    }, 0)}`;
                    groupCard.appendChild(groupPoints);

                    const joinButton = document.createElement("button");
                    joinButton.textContent = "Voir le groupe";
                    joinButton.onclick = () => showGroupPage(group.code);
                    groupCard.appendChild(joinButton);

                    groupList.appendChild(groupCard);
                });
            }
        }

        function calculateScores() {
            const today = new Date().toDateString();
            const lastCalculatedDate = localStorage.getItem("lastCalculatedDate");

            if (today !== lastCalculatedDate) {
                groupes.forEach(group => {
                    group.photos.forEach(photo => {
                        photo.votes.forEach(vote => {
                            const authorUser = utilisateurs.find(u => u.email === photo.author);
                            if (authorUser) {
                                authorUser.points += vote.rating;
                            }
                        });
                    });
                });

                localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
            }

            localStorage.setItem("lastCalculatedDate", today);
        }

        window.onload = function() {
            calculateScores();
        };
