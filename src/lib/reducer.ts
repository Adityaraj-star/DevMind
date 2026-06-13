import type { AppState, AppAction, Theme, AnalysisRecord } from "../types"


function loadAnalysesFromStorage(): AnalysisRecord[] {
    try {
        const saved = localStorage.getItem("devmind-analyses")
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export function saveAnalysesToStorage(analyses: AnalysisRecord[]): void {
    try {
        localStorage.setItem("devmind-analyses", JSON.stringify(analyses))
    } catch {
        // localStorage can be full or disabled 
        console.warn("[Devmind] Could not save analyses to localStorage")
    }
}

export const initialState: AppState = {
    theme: (localStorage.getItem("devmind-theme") as Theme ?? "dark"),
    analyses: loadAnalysesFromStorage(),
    activeAnalysisId: null,
    sidebarOpen: false,
    currentStatus: "idle",
    errorMessage: null,
}

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case "TOGGLE_THEME": {
            const newTheme: Theme = state.theme === "dark" ? "light" : "dark"
            localStorage.setItem("devmind-theme", newTheme)
            return { ...state, theme: newTheme }
        }

        case "TOGGLE_SIDEBAR":
            return { ...state, sidebarOpen: !state.sidebarOpen }

        case "SET_SIDEBAR":
            return { ...state, sidebarOpen: action.payload }
        
        case "ADD_ANALYSIS": {
            const newAnalyses = [action.payload, ...state.analyses]
            saveAnalysesToStorage(newAnalyses)
            return {
                ...state,
                analyses: newAnalyses,
                activeAnalysisId: action.payload.id
            }
        }

        case "DELETE_ANALYSIS": {
            const filtered = state.analyses.filter(a => a.id !== action.payload)
            saveAnalysesToStorage(filtered)
            return {
                ...state,
                analyses: filtered,
                activeAnalysisId: state.activeAnalysisId === action.payload
                    ? null
                    : state.activeAnalysisId
            }
        }

        case "SET_ACTIVE_ANALYSIS":
            return { ...state, activeAnalysisId: action.payload }

        case "SET_STATUS":
            return { ...state, currentStatus: action.payload }

        case "SET_ERROR":
            return {
                ...state,
                currentStatus: "error",
                errorMessage: action.payload
            }

        case "CLEAR_ERROR":
            return { ...state, errorMessage: null, currentStatus: "idle" }
        
        case "UPDATE_ANALYSIS": {
            const updated = state.analyses.map(a =>
                a.id === action.payload.id
                    ? { ...a, ...action.payload.updates }
                    : a
            )
            saveAnalysesToStorage(updated)
            return { ...state, analyses: updated }
        }

        dafault:
            return state
    }
}