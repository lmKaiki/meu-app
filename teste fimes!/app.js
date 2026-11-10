const STORAGE_KEY = "cineflix-state-v1";
const defaultMovies = [
  { id: "big-buck-bunny", title: "Big Buck Bunny", year: 2008, category: "Animação", duration: "10 min", rating: "L", description: "Um coelho gigante e gentil vive tranquilamente até cruzar o caminho de três roedores travessos. Uma aventura divertida, criada pela Blender Foundation como uma produção aberta.", poster: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=700&q=85", video: "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_720p.mp4", license: "Creative Commons Attribution 3.0. Filme da Blender Foundation: blender.org/about/projects/big-buck-bunny/", badge: "OBRA ABERTA" },
  { id: "sintel", title: "Sintel", year: 2010, category: "Fantasia", duration: "15 min", rating: "10+", description: "Em uma jornada por terras desconhecidas, Sintel segue os rastros de um pequeno dragão que se tornou parte de sua vida. Uma história de fantasia do projeto aberto Durian.", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=85", video: "https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4", license: "Creative Commons Attribution 3.0. Filme da Blender Foundation: durian.blender.org/", badge: "OBRA ABERTA" },
  { id: "elephants-dream", title: "Elephants Dream", year: 2006, category: "Ficção científica", duration: "11 min", rating: "10+", description: "Dois personagens exploram uma máquina misteriosa, em um mundo surreal onde cada descoberta abre novas perguntas. O primeiro curta de animação aberto da Blender Foundation.", poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85", video: "https://download.blender.org/ED/ed_1024_512kb.mp4", license: "Creative Commons Attribution 2.5. Filme da Blender Foundation: orange.blender.org/", badge: "OBRA ABERTA" }
];
let state = loadState();
let selectedMovieId = null;
let currentMovieId = null;
let toastTimeout;
const $ = selector => document.querySelector(selector);
const ui = { heroDescription: $("#hero-description"), heroMeta: $("#hero-meta"), heroPlay: $("#hero-play"), heroDetails: $("#hero-details"), movieRow: $("#movie-row"), continueRow: $("#continue-row"), continueSection: $("#continue-section"), search: $("#search-input"), category: $("#category-filter"), favoritesFilter: $("#favorites-filter"), resultsLabel: $("#results-label"), emptyState: $("#empty-state"), detailModal: $("#detail-modal"), playerModal: $("#player-modal"), adminModal: $("#admin-modal"), video: $("#video-player"), adminForm: $("#admin-form"), adminList: $("#admin-list"), adminMessage: $("#admin-message"), toast: $("#toast") };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.movies)) return { movies: saved.movies, favorites: Array.isArray(saved.favorites) ? saved.favorites : [], history: saved.history && typeof saved.history === "object" ? saved.history : {} };
  } catch (error) { console.warn("Não foi possível carregar os dados locais do CINEFLIX.", error); }
  return { movies: defaultMovies, favorites: [], history: {} };
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast("Não foi possível salvar. O armazenamento do navegador pode estar cheio."); }
}
function escapeHTML(value = "") { return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]); }
function getMovie(id) { return state.movies.find(movie => movie.id === id); }
function renderHero() {
  const movie = state.movies[0];
  ui.heroPlay.disabled = !movie; ui.heroDetails.disabled = !movie;
  if (!movie) { ui.heroDescription.textContent = "Adicione um filme pelo painel administrativo para começar sua sessão."; ui.heroMeta.innerHTML = ""; return; }
  ui.heroDescription.textContent = movie.description;
  ui.heroMeta.innerHTML = `<span>${escapeHTML(movie.year)}</span><span>${escapeHTML(movie.duration)}</span><span class="hero-tag">${escapeHTML(movie.rating || "L")}</span>`;
  ui.heroPlay.onclick = () => playMovie(movie.id);
  ui.heroDetails.onclick = () => openDetails(movie.id);
}
function renderCategories() {
  const selected = ui.category.value || "todos";
  const categories = [...new Set(state.movies.map(movie => movie.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  ui.category.innerHTML = '<option value="todos">Todas as categorias</option>' + categories.map(value => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("");
  ui.category.value = categories.includes(selected) ? selected : "todos";
}
function movieCard(movie, progress = 0) {
  const favorite = state.favorites.includes(movie.id), pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const poster = movie.poster ? `background-image:url(&quot;${escapeHTML(movie.poster)}&quot;)` : "background-image:linear-gradient(145deg,#68151a,#161514 65%)";
  return `<article class="movie-card" data-movie-id="${escapeHTML(movie.id)}" tabindex="0" role="button" aria-label="Ver detalhes de ${escapeHTML(movie.title)}"><div class="poster"><div class="poster-image" style="${poster}"></div><div class="poster-shade"></div><div class="poster-topline"><span class="poster-badge">${escapeHTML(movie.badge || "CINEFLIX")}</span><button class="favorite-toggle${favorite ? " is-favorite" : ""}" type="button" data-favorite-id="${escapeHTML(movie.id)}" aria-label="${favorite ? "Remover" : "Adicionar"} ${escapeHTML(movie.title)} ${favorite ? "dos" : "aos"} favoritos" title="${favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.6 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z"></path></svg></button></div><div class="poster-copy"><p class="poster-category">${escapeHTML(movie.category)}</p><h3>${escapeHTML(movie.title)}</h3><p>${escapeHTML(movie.year)} &nbsp;·&nbsp; ${escapeHTML(movie.duration)}</p></div>${progress > 0 ? `<div class="progress-track" aria-label="${pct}% assistido"><div class="progress-fill" style="--progress:${pct}%"></div></div>` : ""}</div><div class="movie-info"><strong>${escapeHTML(movie.rating || "Livre")}</strong><span>${progress > 0 ? `${pct}% assistido` : escapeHTML(movie.category)}</span></div></article>`;
}
function renderMovies() {
  const query = ui.search.value.trim().toLocaleLowerCase("pt-BR"), category = ui.category.value;
  const favoritesOnly = ui.favoritesFilter.getAttribute("aria-pressed") === "true";
  const filtered = state.movies.filter(movie => (!query || [movie.title, movie.category, movie.description, movie.year].join(" ").toLocaleLowerCase("pt-BR").includes(query)) && (category === "todos" || movie.category === category) && (!favoritesOnly || state.favorites.includes(movie.id)));
  ui.movieRow.innerHTML = filtered.map(movie => movieCard(movie)).join("");
  ui.emptyState.hidden = filtered.length !== 0; ui.movieRow.hidden = filtered.length === 0;
  ui.resultsLabel.textContent = query || category !== "todos" || favoritesOnly ? `${filtered.length} ${filtered.length === 1 ? "filme encontrado" : "filmes encontrados"}${favoritesOnly ? " na sua lista" : ""}` : "";
  renderContinue();
}
function renderContinue() {
  const watched = Object.entries(state.history).filter(([id, entry]) => getMovie(id) && entry.progress > .02 && entry.progress < .95).sort((a, b) => b[1].updatedAt - a[1].updatedAt).map(([id, entry]) => movieCard(getMovie(id), entry.progress));
  ui.continueRow.innerHTML = watched.join(""); ui.continueSection.hidden = !watched.length;
}
function openModal(modal) { modal.hidden = false; document.body.style.overflow = "hidden"; modal.querySelector("button, input, select, textarea, video")?.focus({ preventScroll: true }); }
function closeModal(modal) {
  if (modal === ui.playerModal) closePlayer();
  modal.hidden = true;
  if ([ui.detailModal, ui.playerModal, ui.adminModal].every(item => item.hidden)) document.body.style.overflow = "";
}
function openDetails(id) {
  const movie = getMovie(id); if (!movie) return; selectedMovieId = id;
  $("#detail-title").textContent = movie.title; $("#detail-category").textContent = movie.category;
  $("#detail-meta").innerHTML = `<span>${escapeHTML(movie.year)}</span><span>${escapeHTML(movie.duration)}</span><span>${escapeHTML(movie.rating || "Livre")}</span>`;
  $("#detail-description").textContent = movie.description;
  $("#license-note").textContent = movie.license ? `Crédito e licença: ${movie.license}` : "Confira a licença e as permissões do vídeo na fonte original.";
  $("#detail-art").style.backgroundImage = movie.poster ? `url("${movie.poster.replace(/["\\]/g, "")}")` : "linear-gradient(145deg,#68151a,#161514 65%)";
  const favorite = $("#detail-favorite"); favorite.textContent = state.favorites.includes(id) ? "♥  Na minha lista" : "♡  Adicionar à minha lista";
  favorite.onclick = () => toggleFavorite(id); $("#detail-play").onclick = () => playMovie(id); openModal(ui.detailModal);
}
function playMovie(id) {
  const movie = getMovie(id); if (!movie) return; currentMovieId = id; selectedMovieId = id;
  closeModal(ui.detailModal); $("#player-title").textContent = movie.title;
  $("#player-credit").textContent = movie.license ? `Fonte e licença: ${movie.license}` : "Vídeo adicionado localmente pelo administrador.";
  ui.video.pause(); ui.video.removeAttribute("src"); ui.video.load(); ui.video.src = movie.video; ui.video.load(); openModal(ui.playerModal);
  ui.video.play().catch(() => showToast("Toque em reproduzir no player para iniciar o filme."));
}
function closePlayer() {
  if (currentMovieId && ui.video.duration && Number.isFinite(ui.video.duration)) saveProgress(currentMovieId, ui.video.currentTime / ui.video.duration);
  ui.video.pause(); ui.video.removeAttribute("src"); ui.video.load(); currentMovieId = null;
}
function saveProgress(id, progress) {
  if (!id || !Number.isFinite(progress)) return;
  state.history[id] = { progress: Math.max(0, Math.min(1, progress)), updatedAt: Date.now() };
  if (progress >= .95) delete state.history[id]; saveState(); renderContinue();
}
function toggleFavorite(id) {
  if (state.favorites.includes(id)) { state.favorites = state.favorites.filter(item => item !== id); showToast("Removido da sua lista"); }
  else { state.favorites.push(id); showToast("Adicionado à sua lista"); }
  saveState(); renderMovies(); renderAdmin();
  if (!ui.detailModal.hidden && selectedMovieId === id) $("#detail-favorite").textContent = state.favorites.includes(id) ? "♥  Na minha lista" : "♡  Adicionar à minha lista";
}
function showToast(message) { ui.toast.textContent = message; ui.toast.classList.add("is-visible"); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => ui.toast.classList.remove("is-visible"), 2400); }
function renderAdmin() {
  $("#admin-count").textContent = `(${state.movies.length})`;
  ui.adminList.innerHTML = state.movies.map(movie => `<div class="admin-item"><span class="admin-item-title">${escapeHTML(movie.title)}</span><div class="admin-item-actions"><button type="button" data-edit-id="${escapeHTML(movie.id)}">Editar</button><button class="delete-film" type="button" data-delete-id="${escapeHTML(movie.id)}">Excluir</button></div></div>`).join("") || '<p class="admin-explainer">Nenhum filme cadastrado.</p>';
}
function resetAdminForm() { ui.adminForm.reset(); $("#film-id").value = ""; $("#save-film").textContent = "Adicionar filme"; $("#cancel-edit").hidden = true; }
function startEditing(id) {
  const movie = getMovie(id); if (!movie) return;
  for (const [field, value] of Object.entries({ id: movie.id, title: movie.title, year: movie.year, duration: movie.duration, category: movie.category, rating: movie.rating, description: movie.description, poster: movie.poster, video: movie.video, license: movie.license })) $(`#film-${field}`).value = value || "";
  $("#save-film").textContent = "Salvar alterações"; $("#cancel-edit").hidden = false; ui.adminMessage.textContent = ""; $("#film-title").focus();
}
function handleAdminSubmit(event) {
  event.preventDefault(); const form = new FormData(ui.adminForm), id = $("#film-id").value;
  const title = String(form.get("title")).trim(), video = String(form.get("video")).trim(); let parsedVideo;
  try { parsedVideo = new URL(video); } catch { ui.adminMessage.textContent = "Informe uma URL válida para o vídeo."; return; }
  if (parsedVideo.protocol !== "https:") { ui.adminMessage.textContent = "Por segurança, o link do vídeo precisa usar HTTPS."; return; }
  const poster = String(form.get("poster") || "").trim();
  if (poster) { try { if (new URL(poster).protocol !== "https:") throw new Error(); } catch { ui.adminMessage.textContent = "O pôster precisa usar uma URL HTTPS válida."; return; } }
  const existing = id ? getMovie(id) : null;
  const movie = { id: existing ? existing.id : `custom-${Date.now()}`, title, year: Number(form.get("year")), duration: String(form.get("duration")).trim(), category: String(form.get("category")).trim(), rating: String(form.get("rating") || "Livre").trim(), description: String(form.get("description")).trim(), poster, video, license: String(form.get("license") || "").trim(), badge: existing?.badge || "ADICIONADO" };
  if (existing) state.movies = state.movies.map(item => item.id === existing.id ? movie : item); else state.movies.push(movie);
  saveState(); renderAll(); resetAdminForm(); ui.adminMessage.textContent = existing ? "Filme atualizado." : "Filme adicionado ao catálogo.";
}
function renderAll() { renderHero(); renderCategories(); renderMovies(); renderAdmin(); }

$("#search-form").addEventListener("submit", event => event.preventDefault());
ui.search.addEventListener("input", renderMovies); ui.category.addEventListener("change", renderMovies);
ui.favoritesFilter.addEventListener("click", () => { const active = ui.favoritesFilter.getAttribute("aria-pressed") !== "true"; ui.favoritesFilter.setAttribute("aria-pressed", String(active)); ui.favoritesFilter.classList.toggle("is-active", active); renderMovies(); $("#catalogo").scrollIntoView({ behavior: "smooth" }); });
$("#reset-filters").addEventListener("click", () => { ui.search.value = ""; ui.category.value = "todos"; ui.favoritesFilter.setAttribute("aria-pressed", "false"); ui.favoritesFilter.classList.remove("is-active"); renderMovies(); });
$("#scroll-left").addEventListener("click", () => ui.movieRow.scrollBy({ left: -450, behavior: "smooth" })); $("#scroll-right").addEventListener("click", () => ui.movieRow.scrollBy({ left: 450, behavior: "smooth" }));
$("#admin-open").addEventListener("click", () => { ui.adminMessage.textContent = ""; renderAdmin(); openModal(ui.adminModal); }); ui.adminForm.addEventListener("submit", handleAdminSubmit); $("#cancel-edit").addEventListener("click", resetAdminForm); $("#current-year").textContent = new Date().getFullYear();
document.addEventListener("click", event => {
  const close = event.target.closest("[data-close]"); if (close) { const modal = document.getElementById(close.dataset.close); if (modal) closeModal(modal); return; }
  const favorite = event.target.closest("[data-favorite-id]"); if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favoriteId); return; }
  const edit = event.target.closest("[data-edit-id]"); if (edit) { startEditing(edit.dataset.editId); return; }
  const remove = event.target.closest("[data-delete-id]");
  if (remove) { const movie = getMovie(remove.dataset.deleteId); if (!movie || !window.confirm(`Excluir "${movie.title}" do catálogo?`)) return; state.movies = state.movies.filter(item => item.id !== movie.id); state.favorites = state.favorites.filter(item => item !== movie.id); delete state.history[movie.id]; saveState(); renderAll(); resetAdminForm(); ui.adminMessage.textContent = "Filme excluído do catálogo."; return; }
  const card = event.target.closest(".movie-card"); if (card && !event.target.closest("button")) openDetails(card.dataset.movieId);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") [ui.detailModal, ui.playerModal, ui.adminModal].forEach(modal => { if (!modal.hidden) closeModal(modal); });
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".movie-card")) { event.preventDefault(); openDetails(event.target.dataset.movieId); }
});
ui.video.addEventListener("play", () => { if (!currentMovieId) return; state.history[currentMovieId] = { progress: .01, updatedAt: Date.now() }; saveState(); renderContinue(); });
ui.video.addEventListener("timeupdate", () => { if (currentMovieId && ui.video.duration && Number.isFinite(ui.video.duration)) saveProgress(currentMovieId, ui.video.currentTime / ui.video.duration); });
ui.video.addEventListener("ended", () => { if (currentMovieId) saveProgress(currentMovieId, 1); });
ui.video.addEventListener("error", () => { if (currentMovieId && !ui.playerModal.hidden) showToast("Não foi possível carregar este vídeo. Verifique a conexão ou o link cadastrado."); });
renderAll();
