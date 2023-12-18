import supabase from "../supabaseClient"
import { IList } from "../types/lists";

export const updateLists = async (updatedLists: IList[], setLoading: (b: boolean) => void) => {
  try {
    setLoading(true)
    const { error } = await supabase
      .from('Lists')
      .upsert(updatedLists)
    if (error) {
      throw new Error(error.message)
    }
  } catch (e) {
    console.error('Error update lists', e)
  } finally {
    setLoading(false)
  }
}