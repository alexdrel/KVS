package diagnostics

var Kvs_collect_is_only_supported_in_a_terminal_value_position = &Message{
	code:     100069,
	category: CategoryError,
	key:      "Kvs_collect_is_only_supported_in_a_terminal_value_position_100069",
	text:     "KVS 'collect' must be at the head of a supported value expression.",
}

var Kvs_select_is_only_supported_in_a_terminal_value_position = &Message{
	code:     100070,
	category: CategoryError,
	key:      "Kvs_select_is_only_supported_in_a_terminal_value_position_100070",
	text:     "KVS 'select' must be at the head of a supported value expression.",
}

var Kvs_nullable_binding_requires_an_inferred_let_declaration_with_an_initializer = &Message{
	code:     100071,
	category: CategoryError,
	key:      "Kvs_nullable_binding_requires_an_inferred_let_declaration_with_an_initializer_100071",
	text:     "A KVS nullable binding requires an inferred 'let' declaration with an initializer.",
}

var Kvs_terminal_default_requires_a_single_supported_primitive_or_array_family = &Message{
	code:     100072,
	category: CategoryError,
	key:      "Kvs_terminal_default_requires_a_single_supported_primitive_or_array_family_100072",
	text:     "KVS terminal '!' requires string, number, boolean, bigint, or a non-tuple array.",
}

var Kvs_terminal_default_cannot_determine_a_default_for_an_absence_only_type = &Message{
	code:     100073,
	category: CategoryError,
	key:      "Kvs_terminal_default_cannot_determine_a_default_for_an_absence_only_type_100073",
	text:     "KVS terminal '!' cannot determine a default value from an absence-only type.",
}
