const API_URL = "/funcionarios";

let employees = [];
let editingId = null;
let originalEmployee = null;

const list = document.querySelector("[data-employee-list]");
const emptyState = document.querySelector("[data-empty-state]");
const searchInput = document.querySelector("[data-search]");
const statusFilter = document.querySelector("[data-status-filter]");
const resultsCount = document.querySelector("[data-results-count]");
const modal = document.querySelector("[data-modal-backdrop]");
const detailsModal = document.querySelector("[data-details-modal]");
const detailsContent = document.querySelector("[data-details-content]");
const detailsTitle = document.querySelector("#details-modal-title");
const form = document.querySelector("[data-employee-form]");
const modalTitle = document.querySelector("#modal-title");
const submitButton = document.querySelector("[data-submit-form]");
const toast = document.querySelector("[data-toast]");

document.querySelector("[data-open-create]").addEventListener("click", openCreateModal);
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
document.querySelectorAll("[data-close-details-modal]").forEach((button) => button.addEventListener("click", closeDetailsModal));
document.querySelector("[data-details-edit]").addEventListener("click", () => {
    const id = Number(detailsModal.dataset.employeeId);
    closeDetailsModal();
    openEditModal(id);
});
searchInput.addEventListener("input", renderEmployees);
statusFilter.addEventListener("change", renderEmployees);
form.addEventListener("submit", saveEmployee);
modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});
detailsModal.addEventListener("click", (event) => {
    if (event.target === detailsModal) closeDetailsModal();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    if (event.key === "Escape" && !detailsModal.classList.contains("hidden")) closeDetailsModal();
});

loadEmployees();

async function loadEmployees() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Não foi possível consultar os funcionários.");

        employees = await response.json();
        renderEmployees();
    } catch (error) {
        employees = [];
        renderEmployees();
        showToast("Não foi possível carregar os dados da API.");
    }
}

async function renderEmployees() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    let filteredEmployees = employees;

    if (/^\d+$/.test(searchTerm)) {
        try {
            const response = await fetch(`${API_URL}/${searchTerm}`);
            filteredEmployees = response.ok ? [await response.json()] : [];
        } catch (error) {
            filteredEmployees = [];
        }
    } else {
        filteredEmployees = employees.filter((employee) => {
            const searchableText = `${employee.id} ${employee.nome} ${employee.cargo} ${employee.departamento}`.toLowerCase();
            return searchableText.includes(searchTerm) && (!selectedStatus || employee.status === selectedStatus);
        });
    }

    if (selectedStatus) {
        filteredEmployees = filteredEmployees.filter((employee) => employee.status === selectedStatus);
    }

    list.innerHTML = filteredEmployees.map(employeeRow).join("");
    emptyState.classList.toggle("hidden", filteredEmployees.length > 0);
    resultsCount.textContent = `${filteredEmployees.length} ${filteredEmployees.length === 1 ? "funcionário" : "funcionários"}`;
    updateMetrics();

    list.querySelectorAll("[data-edit]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            openEditModal(Number(button.dataset.edit));
        });
    });
    list.querySelectorAll("[data-delete]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteEmployee(Number(button.dataset.delete));
        });
    });
    list.querySelectorAll("[data-employee-row]").forEach((row) => {
        row.addEventListener("click", () => openDetailsModal(Number(row.dataset.employeeRow)));
        row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDetailsModal(Number(row.dataset.employeeRow));
            }
        });
    });
}

function employeeRow(employee) {
    const initials = employee.nome.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const status = statusLabel(employee.status);

    return `
        <tr class="cursor-pointer transition hover:bg-[#F9FAFB]" data-employee-row="${employee.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${escapeHtml(employee.nome)}">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="avatar">${initials}</div>
                    <div>
                        <p class="font-semibold text-[#1F2937]">${escapeHtml(employee.nome)}</p>
                        <p class="mt-1 text-xs text-[#6B7280]">ID #${employee.id} · ${escapeHtml(employee.email)}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-[#4B5563]">${escapeHtml(employee.cargo)}</td>
            <td class="px-6 py-4 text-[#4B5563]">${escapeHtml(employee.departamento)}</td>
            <td class="px-6 py-4"><span class="status-badge ${status.className}">${status.label}</span></td>
            <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                    <button class="table-action" type="button" data-edit="${employee.id}" title="Editar todos os dados">Editar</button>
                    <button class="table-action table-action-danger" type="button" data-delete="${employee.id}" title="Excluir funcionário">Excluir</button>
                </div>
            </td>
        </tr>
    `;
}

function openCreateModal() {
    editingId = null;
    originalEmployee = null;
    form.reset();
    form.elements.id.value = "";
    modalTitle.textContent = "Novo funcionário";
    submitButton.textContent = "Salvar funcionário";
    showModal();
}

async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Funcionário não encontrado.");

        const employee = await response.json();
        editingId = id;
        originalEmployee = employee;
        modalTitle.textContent = "Editar funcionário";
        submitButton.textContent = "Salvar alterações";
        Object.entries(employee).forEach(([key, value]) => {
            if (form.elements[key]) form.elements[key].value = value ?? "";
        });
        showModal();
    } catch (error) {
        showToast("Não foi possível consultar esse funcionário.");
    }
}

async function openDetailsModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Funcionário não encontrado.");

        const employee = await response.json();
        detailsTitle.textContent = employee.nome;
        detailsContent.innerHTML = employeeDetails(employee);
        detailsModal.dataset.employeeId = id;
        detailsModal.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
    } catch (error) {
        showToast("Não foi possível consultar esse funcionário.");
    }
}

function employeeDetails(employee) {
    const status = statusLabel(employee.status);
    const fields = [
        ["ID", `#${employee.id}`],
        ["Nome completo", employee.nome],
        ["E-mail", employee.email],
        ["Telefone", employee.telefone],
        ["Cargo", employee.cargo],
        ["Departamento", employee.departamento],
        ["Salário", formatSalary(employee.salario)],
        ["Cidade", employee.cidade]
    ];

    return `${fields.map(([label, value]) => `
        <div class="details-field">
            <dt>${label}</dt>
            <dd>${escapeHtml(value || "Não informado")}</dd>
        </div>
    `).join("")}
    <div class="details-field">
        <dt>Status</dt>
        <dd><span class="status-badge ${status.className}">${status.label}</span></dd>
    </div>`;
}

async function saveEmployee(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.id;
    data.salario = data.salario === "" ? null : Number(data.salario);

    const isNewEmployee = editingId === null;
    const changedFields = isNewEmployee ? [] : getChangedFields(data, originalEmployee);
    const patchFields = ["cargo", "salario", "status"];
    const canUsePatch = changedFields.length > 0
        && changedFields.every((fieldName) => patchFields.includes(fieldName))
        && !(changedFields.includes("salario") && data.salario === null);
    const method = isNewEmployee ? "POST" : canUsePatch ? "PATCH" : "PUT";
    const url = isNewEmployee ? API_URL : `${API_URL}/${editingId}`;
    const body = method === "PATCH"
        ? Object.fromEntries(changedFields.map((fieldName) => [fieldName, data[fieldName]]))
        : data;

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("Não foi possível salvar o funcionário.");

        closeModal();
        await loadEmployees();
        showToast(isNewEmployee ? "Funcionário cadastrado com sucesso." : "Funcionário atualizado com sucesso.");
    } catch (error) {
        showToast("Não foi possível salvar o funcionário.");
    }
}

function getChangedFields(data, original) {
    return ["nome", "email", "telefone", "cargo", "departamento", "salario", "cidade", "status"]
        .filter((fieldName) => normalizeValue(data[fieldName], fieldName) !== normalizeValue(original[fieldName], fieldName));
}

function normalizeValue(value, fieldName) {
    if (fieldName === "salario") return value === "" || value === null || value === undefined ? null : Number(value);
    return value ?? "";
}

async function deleteEmployee(id) {
    if (!window.confirm("Deseja excluir este funcionário?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Não foi possível excluir o funcionário.");

        await loadEmployees();
        showToast("Funcionário excluído.");
    } catch (error) {
        showToast("Não foi possível excluir o funcionário.");
    }
}

function updateMetrics() {
    const metrics = {
        total: employees.length,
        analysis: employees.filter((employee) => employee.status === "EM_ANALISE").length,
        approved: employees.filter((employee) => employee.status === "APROVADO").length,
        rejected: employees.filter((employee) => employee.status === "REPROVADO").length,
        hired: employees.filter((employee) => employee.status === "CONTRATADO").length
    };
    Object.entries(metrics).forEach(([key, value]) => {
        const element = document.querySelector(`[data-metric="${key}"]`);
        if (element) element.textContent = value;
    });
}

function statusLabel(status) {
    const labels = {
        EM_ANALISE: { label: "Em análise", className: "status-analysis" },
        APROVADO: { label: "Aprovado", className: "status-approved" },
        REPROVADO: { label: "Reprovado", className: "status-rejected" },
        CONTRATADO: { label: "Contratado", className: "status-hired" }
    };
    return labels[status] || labels.EM_ANALISE;
}

function showModal() {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    form.elements.nome.focus();
}

function closeModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}

function closeDetailsModal() {
    detailsModal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}

function formatSalary(salary) {
    if (salary === null || salary === undefined || salary === "") return "Não informado";
    return Number(salary).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.add("hidden"), 2800);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
    }[character]));
}
