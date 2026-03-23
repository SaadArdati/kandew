const MAX_ALLOWED_PETALS = 5;
const EMPTY_PETAL = '◌';

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function parseTaskDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const date = new Date(`${value}T23:59:59`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function getTaskMaxPetals(task) {
    return clamp(Number(task?.maxPetals ?? 0), 0, MAX_ALLOWED_PETALS);
}

export function normalizeTask(task) {
    const maxPetals = getTaskMaxPetals(task);

    return {
        ...task,
        maxPetals,
        createdAt: task.createdAt ?? new Date().toISOString(),
        reviewEnteredAt: task.reviewEnteredAt ?? null,
        frozenPetalsAtReview:
            task.frozenPetalsAtReview == null
                ? null
                : clamp(Number(task.frozenPetalsAtReview), 0, maxPetals),
        completedAt: task.completedAt ?? null,
        earnedPetals:
            task.earnedPetals == null
                ? null
                : clamp(Number(task.earnedPetals), 0, maxPetals),
    };
}

export function getCurrentActivePetals(task, referenceTime = new Date()) {
    const normalizedTask = normalizeTask(task);
    const maxPetals = normalizedTask.maxPetals;

    if (maxPetals === 0) return 0;

    const createdAt = parseTaskDate(normalizedTask.createdAt);
    const dueDate = parseTaskDate(normalizedTask.dueDate);
    const now = parseTaskDate(referenceTime) ?? new Date();

    if (!createdAt || !dueDate) {
        return maxPetals;
    }

    if (now <= createdAt) {
        return maxPetals;
    }

    if (now >= dueDate) {
        return 0;
    }

    const totalDurationMs = dueDate.getTime() - createdAt.getTime();

    if (totalDurationMs <= 0) {
        return 0;
    }

    const remainingMs = dueDate.getTime() - now.getTime();
    const remainingRatio = remainingMs / totalDurationMs;

    return clamp(Math.ceil(maxPetals * remainingRatio), 0, maxPetals);
}

export function getTaskPetals(task, referenceTime = new Date()) {
    const normalizedTask = normalizeTask(task);
    const maxPetals = normalizedTask.maxPetals;

    if (maxPetals === 0) return 0;

    if (normalizedTask.columnId === 'review') {
        if (normalizedTask.frozenPetalsAtReview != null) {
            return clamp(normalizedTask.frozenPetalsAtReview, 0, maxPetals);
        }

        return getCurrentActivePetals(normalizedTask, normalizedTask.reviewEnteredAt ?? referenceTime);
    }

    if (normalizedTask.columnId === 'done') {
        if (normalizedTask.earnedPetals != null) {
            return clamp(normalizedTask.earnedPetals, 0, maxPetals);
        }

        if (normalizedTask.completedAt) {
            return getCurrentActivePetals(normalizedTask, normalizedTask.completedAt);
        }

        return 0;
    }

    return getCurrentActivePetals(normalizedTask, referenceTime);
}

export function getEarnedPetals(task) {
    const normalizedTask = normalizeTask(task);

    if (normalizedTask.columnId !== 'done') {
        return 0;
    }

    return clamp(Number(normalizedTask.earnedPetals ?? 0), 0, normalizedTask.maxPetals);
}

export function transitionTaskForColumn(task, targetColumnId, referenceTime = new Date()) {
    const normalizedTask = normalizeTask(task);
    const nowIso = (parseTaskDate(referenceTime) ?? new Date()).toISOString();

    if (targetColumnId === 'review') {
        return {
            ...normalizedTask,
            columnId: targetColumnId,
            reviewEnteredAt: nowIso,
            frozenPetalsAtReview: getCurrentActivePetals(normalizedTask, referenceTime),
            completedAt: null,
            earnedPetals: null,
        };
    }

    if (targetColumnId === 'done') {
        const earnedPetals =
            normalizedTask.columnId === 'review'
                ? clamp(
                      Number(
                          normalizedTask.frozenPetalsAtReview ??
                              getCurrentActivePetals(normalizedTask, normalizedTask.reviewEnteredAt ?? referenceTime)
                      ),
                      0,
                      normalizedTask.maxPetals
                  )
                : getCurrentActivePetals(normalizedTask, referenceTime);

        return {
            ...normalizedTask,
            columnId: targetColumnId,
            completedAt: nowIso,
            earnedPetals,
        };
    }

    return {
        ...normalizedTask,
        columnId: targetColumnId,
        reviewEnteredAt: null,
        frozenPetalsAtReview: null,
        completedAt: null,
        earnedPetals: null,
    };
}

export function formatTaskDueDate(dateValue) {
    const date = parseTaskDate(dateValue);
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function isDueSoon(task, referenceTime = new Date()) {
    const normalizedTask = normalizeTask(task);

    if (normalizedTask.columnId === 'done' || normalizedTask.columnId === 'review') {
        return false;
    }

    const dueDate = parseTaskDate(normalizedTask.dueDate);
    const now = parseTaskDate(referenceTime) ?? new Date();

    if (!dueDate) return false;

    const diffMs = dueDate.getTime() - now.getTime();
    const oneDayMs = 1000 * 60 * 60 * 24;

    return diffMs > 0 && diffMs <= oneDayMs;
}

export function buildPetalSlots(task, referenceTime = new Date()) {
    const maxPetals = getTaskMaxPetals(task);
    const currentPetals = getTaskPetals(task, referenceTime);

    return Array.from({ length: maxPetals }, (_, index) => ({
        key: `${task.id}-petal-${index}`,
        filled: index < currentPetals,
        label: index < currentPetals ? '🌸' : EMPTY_PETAL,
    }));
}