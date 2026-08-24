const API_URL = "/funcionarios";

let employees = [];
let editingId = null;
let partialMode = false;

const list = document.querySelector("[data-employee-list]");
const emptyState = document.querySelector("[data-empty-state]");
const searchInput = document.querySelector("[data-search]");
const statusFilter = document.querySelector("[data-status-filter]");
const resultsCount = document.querySelector("[data-results-count]");
const modal = document.querySelector("[data-modal-backdrop]");
const form = document.querySelector("[data-employee-form]");
const modalTitle = document.querySelector("#modal-title");
const submitButton = document.querySelector("[data-submit-form]");
const partialHelp = document.querySelector("[data-partial-help]");
const toast = document.querySelector("[data-toast]");

document.querySelector("[data-open-create]").addEventListener("click", openCreateModal);
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
searchInput.addEventListener("input", renderEmployees);
statusFilter.addEventListener("change", renderEmployees);
form.addEventListener("submit", saveEmployee);
modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
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
        button.addEventListener("click", () => openEditModal(Number(button.dataset.edit), false));
    });
    list.querySelectorAll("[data-partial]").forEach((button) => {
        button.addEventListener("click", () => openEditModal(Number(button.dataset.partial), true));
    });
    list.querySelectorAll("[data-delete]").forEach((button) => {
        button.addEventListener("click", () => deleteEmployee(Number(button.dataset.delete)));
    });
}

function employeeRow(employee) {
    const initials = employee.nome.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const status = statusLabel(employee.status);

    return `
        <tr class="transition hover:bg-[#F9FAFB]">
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
                    <button class="table-action table-action-muted" type="button" data-partial="${employee.id}" title="Alterar cargo, salário ou status">Editar parcialmente</button>
                    <button class="table-action table-action-danger" type="button" data-delete="${employee.id}" title="Excluir funcionário">Excluir</button>
                </div>
            </td>
        </tr>
    `;
}

function openCreateModal() {
    editingId = null;
    partialMode = false;
    form.reset();
    form.elements.id.value = "";
    modalTitle.textContent = "Novo funcionário";
    submitButton.textContent = "Salvar funcionário";
    partialHelp.classList.add("hidden");
    setEditableFields(true);
    showModal();
}

async function openEditModal(id, isPartial) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Funcionário não encontrado.");

        const employee = await response.json();
        editingId = id;
        partialMode = isPartial;
        modalTitle.textContent = isPartial ? "Atualização parcial" : "Editar funcionário";
        submitButton.textContent = isPartial ? "Aplicar atualização" : "Salvar alterações";
        partialHelp.classList.toggle("hidden", !isPartial);
        Object.entries(employee).forEach(([key, value]) => {
            if (form.elements[key]) form.elements[key].value = value ?? "";
        });
        setEditableFields(!isPartial);
        showModal();
    } catch (error) {
        showToast("Não foi possível consultar esse funcionário.");
    }
}

function setEditableFields(fullEdit) {
    ["nome", "email", "telefone", "departamento", "cidade"].forEach((fieldName) => {
        form.elements[fieldName].disabled = !fullEdit;
    });
}

async function saveEmployee(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.id;
    data.salario = data.salario ? Number(data.salario) : null;

    const isNewEmployee = editingId === null;
    const method = isNewEmployee ? "POST" : partialMode ? "PATCH" : "PUT";
    const url = isNewEmployee ? API_URL : `${API_URL}/${editingId}`;
    const body = partialMode
        ? { cargo: data.cargo, salario: data.salario, status: data.status }
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
    form.elements[partialMode ? "cargo" : "nome"].focus();
}

function closeModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
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
