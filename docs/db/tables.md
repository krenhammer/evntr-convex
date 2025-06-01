
games:
owner_id  
name
description   
game_type
start_date
end_date
status
created_at 
created_by
updated_at (optional)
updated_by (optional)

game_players:
game_id
user_id 
role (host, player, admin)  
status
created_at 
created_by
updated_at (optional)
updated_by (optional)

game_items:
game_id
game_player_id (optional)   
game_team_id (optional)
name
description
count (optional)
game_media_id (optional)
order (optional)
approved_date (optional)
approved_by (optional)
created_at 
created_by
updated_at (optional)
updated_by (optional)

game_teams:
game_id
team_name
created_at 
created_by
updated_at (optional)
updated_by (optional)

game_players_teams:
game_player_id
game_team_id
created_at 
created_by
updated_at (optional)
updated_by (optional)

game_results:
finished_date
game_id
user_id
game_item_id (optional)
game_team_id (optional)
order (optional)
points (optional) 
created_at 
created_by
updated_at (optional)
updated_by (optional) 


game_settings:
game_id
setting_key (e.g., "time_limit", "max_players", "rounds", "difficulty")
setting_value
setting_type (string, number, boolean, json)
created_at
updated_at

game_state:
game_id
current_round (optional)
current_turn_player_id (optional)
current_turn_team_id (optional)
game_data (JSON - flexible state storage)
last_action_at
created_at
updated_at

game_rounds:
game_id
round_number
round_type (optional)
start_time
end_time (optional)
round_data (JSON)
status

game_media:
game_id
game_item_id (optional)
media_type (image, audio, video, text)
storage_id(optional)
url (optional)
media_metadata (JSON)
created_at
created_by
updated_at (optional)
updated_by (optional)