import { supabase } from "./supabaseClient";

export async function saveMatch({ userId, username, win }) {
	if (!userId) return;

	const { data: existing, error: fetchError } = await supabase
		.from("leaderboard")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (fetchError && fetchError.code !== "PGRST116") {
		throw fetchError;
	}

	if (!existing) {
		const { error } = await supabase.from("leaderboard").insert({
			user_id: userId,
			username,
			wins: win ? 1 : 0,
			losses: win ? 0 : 1,
			updated_at: new Date().toISOString(),
		});

		if (error) throw error;
		return;
	}

	const { error } = await supabase
		.from("leaderboard")
		.update({
			username,
			wins: existing.wins + (win ? 1 : 0),
			losses: existing.losses + (win ? 0 : 1),
			updated_at: new Date().toISOString(),
		})
		.eq("user_id", userId);

	if (error) throw error;
}

export async function getLeaderboard() {
	const { data, error } = await supabase
		.from("leaderboard")
		.select("username, wins, losses")
		.order("wins", { ascending: false })
		.limit(10);

	if (error) throw error;

	return data ?? [];
}
