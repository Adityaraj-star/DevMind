import { useAppContext } from "../context/AppContext"
import type { Theme } from '../types'

// custom hook that manages dark/light theme
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
    const { state, dispatch } = useAppContext()

    const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" })

    return { theme: state.theme, toggleTheme }
}
