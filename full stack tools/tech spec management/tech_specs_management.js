$(function () {
    if (toolbox) {
        toolbox.simply_select.tech_specs_management = new TechSpecsManagement();
    }
});

function TechSpecsManagement() {
    this.loadPage = loadPage;
	this.loadPreset = loadPreset;
	this.getCanonical = getCanonical;
    this.changeProductType = changeProductType;
    this.addTechSpecCategory = addTechSpecCategory;
    this.addTechSpecField = addTechSpecField;
    this.editTechSpecCategory = editTechSpecCategory;
    this.editTechSpecField = editTechSpecField;
    this.deleteTechSpecCategory = deleteTechSpecCategory;
    this.deleteTechSpecField = deleteTechSpecField;

    // TSM GLOBAL VARS
    var product_type_selected = false,
        active_category_id    = 0;

    function loadPage(data_obj) {
        var source = $('#simply_select_tech_specs_management').html();
        var template = Handlebars.compile(source);

        $('#content_container').html(template({
            'data_obj': data_obj,
            'page_title': $('.sidebar-link-selected').html(),
            'load_tech_specs_management': 1
        }));

        if (toolbox.selected_client_product_type_id > 0 &&
            toolbox.selected_language_id > 0) {
            changeProductType();
        }

    }

	// Has a specific client / product_id been requested?
	function loadPreset(pageparam) {
		
		function handler(modal_obj){
			toolbox.selected_client_product_type_id     = modal_obj.client_product_type_id;
			toolbox.selected_product_type_id            = modal_obj.product_type_id;
			toolbox.selected_product_type_name          = modal_obj.product_type_name;
			toolbox.selected_language_id                = modal_obj.language_id;
			toolbox.selected_language_name              = modal_obj.language_name;
			toolbox.selected_client_id                  = modal_obj.client_id;
            toolbox.selected_client_name                = modal_obj.client_name;
			return changeProductType();
		}
		
		var params = {
	            module: 'simply_select',
	            action: 'get_scoring_question_header',
	            data: {	client_product_type_id: pageparam[1],
						language_id: pageparam[2]
				}
	        };
		toolbox.selected_client_product_type_id = 0;		// prevent loadPage from auto-loading any data
		return toolbox.ajax(params, handler);
	}
	
	function getCanonical(action_name) {
		var res = '/tech_specs_management';

        if (toolbox.selected_client_id > 0) {
            res += '/' + toolbox.selected_client_id;
            if (toolbox.selected_client_product_type_id) {
                res += '/' + toolbox.selected_client_product_type_id;
                if (toolbox.selected_language_id) {
                    res += '/' + toolbox.selected_language_id;
                }
            }
        }

		return res;
	}

    /******************************
     * General Methods
     ******************************/

    //parse information from change product type modal
    function changeProductType() {

        //TSM global var
        product_type_selected = true;
		toolbox.navigation.setCanonical();

        $('#tsm_product_type_name')
            .html(toolbox.selected_client_name + " &mdash; " + toolbox.selected_product_type_name + " &mdash; " + toolbox.selected_language_name)
            .attr('client_product_type_id', toolbox.selected_client_product_type_id)
            .attr('language_id', toolbox.selected_language_id);

        if (toolbox.selected_client_id) {
            loadTechSpecCategoryList();
        }
    }

    //Load a list of tech spec categories
    function loadTechSpecCategoryList() {

        var params = {
            action: 'get_tech_spec_list_by_product_type',
            data: {
                client_product_type_id : toolbox.selected_client_product_type_id,
                //client_id              : toolbox.selected_client_id,
                language_id            : toolbox.selected_language_id
            }
        };

        function handler(data_obj) {

            var list_empty = 0;

            if (jQuery.isEmptyObject(data_obj)) {
                list_empty = 1;
            }

            var source = $('#simply_select_tech_specs_management').html();
            var template = Handlebars.compile(source);

            $('#tsm_left').html(template({
                'data_obj': data_obj,
                'load_tech_spec_category_list': 1,
                'list_empty': list_empty
            }));

            //prevent delete of empty categories
            $('.recursive-list-row[depth|="tech_spec_category"]').each(function () {
                if ($(this).attr('tech_spec_field_count') > 0) {
                    $(this).find('.icon-delete').addClass('hidden');
                }
            });

            loadTechSpecFields(data_obj);

            if (active_category_id) {
                $('[tech_spec_category_id="' + active_category_id + '"]').click();
            }
        }

        return toolbox.ajax(params, handler);
    }

    function loadTechSpecFields(data_obj) {
        var list_empty = 0;

        if (jQuery.isEmptyObject(data_obj)) {
            list_empty = 1;
        }

        var source = $('#simply_select_tech_specs_management').html();
        var template = Handlebars.compile(source);
        $('#tsm_right').html(template({
            'data_obj': data_obj,
            'load_tech_spec_fields': 1,
            'list_empty': list_empty
        }));

        $('.recursive-child-container').each(function () {
            $(this).sortable({
                handle: '.icon-grip'
            });
        });

        //prevent delete of empty categories
        $('.recursive-list-row[depth|="tech_spec_category"]').each(function () {
            if ($(this).attr('tech_spec_field_count') > 0) {
                $(this).find('.icon-delete').addClass('hidden');
            }
        });
    }

    //add a new tech spec category
    function addTechSpecCategory(modal_obj) {

        var params = {
            action: 'add_tech_spec_category',
            data: {
                client_product_type_id      : toolbox.selected_client_product_type_id,
                language_id                 : toolbox.selected_language_id,
                //client_id                   : toolbox.selected_client_id,
                tech_spec_category_name     : modal_obj.form_tech_spec_category_name
            }
        };

        function handler(data_obj) {

            if (data_obj.tech_spec_category_id == 0) {

                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'You can not add that tech spec category it already exists.'},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);

            }
            else {
                data_obj['product_type_id'] = toolbox.selected_product_type_id;
                data_obj['language_id'] = toolbox.selected_language_id;
                data_obj['product_type_name'] = toolbox.selected_product_type_name;
                changeProductType(data_obj);
            }

        }

        return toolbox.ajax(params, handler);
    }

    //add a new tech spec field
    function addTechSpecField(modal_obj) {

        var tech_spec_options = new Array();

        $('.list-row', '#tsm_tech_specs_options_container').each(function () {

            tech_spec_options.push($(this).attr('tech_spec_option_name'));

        });

        var params = {
            action: 'add_tech_spec_field',
            data: {
                'tech_spec_category_id': modal_obj.form_tech_spec_category_id,
                'tech_spec_field_name': modal_obj.form_tech_spec_field_name,
                'tech_spec_field_unit': modal_obj.form_tech_spec_field_unit,
                'tech_spec_field_type': modal_obj.form_tech_spec_field_type,
                'tech_spec_options': tech_spec_options + ''
            }
        };

        function handler(data_obj) {

            if (data_obj.tech_spec_field_id == 0) {

                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'You can not add that tech spec field it already exists.'},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);

            }
            else {
                /*data_obj['product_type_id'] = toolbox.selected_product_type_id;
                data_obj['language_id'] = toolbox.selected_language_id;
                data_obj['product_type_name'] = toolbox.selected_product_type_name;*/
                loadTechSpecCategoryList();
            }

        }

        return toolbox.ajax(params, handler);
    }

    //edit a tech spec category
    function editTechSpecCategory(modal_obj) {

        var params = {
            action: 'edit_tech_spec_category',
            data: {
                'tech_spec_category_id': modal_obj.form_tech_spec_category_id,
                'tech_spec_category_name': modal_obj.form_tech_spec_category_name
            }
        };

        function handler(data_obj) {

            if (data_obj.success == 0) {

                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'You can not change the tech spec category name to that because it already exists.'},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);

            }
            else {
                var data_obj = {
                    'product_type_id': toolbox.selected_product_type_id,
                    'language_id': toolbox.selected_language_id,
                    'product_type_name': toolbox.selected_product_type_name
                };

                changeProductType(data_obj);
            }

        }

        return toolbox.ajax(params, handler);
    }

    //edit a tech spec field
    function editTechSpecField(modal_obj) {

        var tech_spec_options = {};

        $('.list-row[tech_spec_option_id]', '#tsm_tech_specs_options_container').each(function () {
            tech_spec_option_id     = $(this).attr('tech_spec_option_id');
            tech_spec_option_name   = $(this).attr('tech_spec_option_name');

            tech_spec_options[tech_spec_option_name] = null;

            // create array where option_name => option_id if it has an option_id, or null if it will be added
            if(tech_spec_option_id > 0) {
                tech_spec_options[tech_spec_option_name] = tech_spec_option_id;
            }
        });

        var params = {
            action: 'edit_tech_spec_field',
            data: {
                'tech_spec_field_id'    : modal_obj.form_tech_spec_field_id,
                'tech_spec_field_name'  : modal_obj.form_tech_spec_field_name,
                'tech_spec_field_unit'  : modal_obj.form_tech_spec_field_unit,
                'new_tech_spec_options' : tech_spec_options
            }
        };

        function handler(data_obj) {
            var error_msg = '',
                error = false,
                index,
                option_name_list = [];

            // if update didn't work
            if (data_obj.update.success == 0) {
                    error = true;
            }

            // if items were being deleted
            if (data_obj.delete !== null) {
                // if any failed
                if (typeof data_obj.delete.success == typeof undefined) {
                    error = true;
                }
            }

            if (error) {
                // if name update failed
                if (data_obj.update.success == 0) {
                    error_msg = 'You can not change the tech spec field name to that because it already exists. ';
                }

                // if delete failed
                if (data_obj.delete !== null && typeof data_obj.delete.failed !== typeof undefined) {
                    error_msg += 'The following options can not be deleted because they are in use: ';
                    for (index in data_obj.delete.failed) {
                        if (data_obj.delete.failed.hasOwnProperty(index)) {
                            option_name_list.push(data_obj.delete.failed[index]);
                        }
                    }

                    error_msg += option_name_list.join(', ');
                }

                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': error_msg},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);

            } else {
                changeProductType();
            }

        }

        return toolbox.ajax(params, handler);
    }

    //delete a Tech Spec Category
    function deleteTechSpecCategory(modal_obj) {

        var params = {
            action: 'delete_tech_spec_category',
            data: {'tech_spec_category_id': modal_obj.tech_spec_category_id}
        };

        function handler(data_obj) {

            //remove the category from the list
            $('.recursive-list-row[depth|="tech_spec_category"]').each(function () {

                if ($(this).attr('tech_spec_category_id') == modal_obj.tech_spec_category_id) {
                    $(this).next('ul').empty().remove();
                    $(this).empty().remove();
                }

            });

        }

        return toolbox.ajax(params, handler);
    }

    //delete a Tech Spec Field
    function deleteTechSpecField(modal_obj) {

        var params = {
            action: 'delete_tech_spec_field',
            data: {'tech_spec_field_id': modal_obj.tech_spec_field_id}
        };

        function handler(data_obj) {
            if (data_obj.success == 1) {
                loadTechSpecCategoryList();
            } else {
                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'An error occurred, the selected field is in use and cannot be deleted.'},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);
            }

        }

        return toolbox.ajax(params, handler);
    }

    /******************************
     * Event Handlers
     ******************************/

        //handler for client select
    $(document).on('change', '#tsm_client_select', function () {
        var newValue = $(this).val();

        if (newValue) {
            toolbox.selected_client_id = newValue;
            if (product_type_selected) {
                loadTechSpecCategoryList();
            }
        }
    });

    //on click of category add button show modal
    $('#tsm_add_category').live('click', function () {

        var full_obj = {'product_type_id': toolbox.selected_product_type_id};

        var modal_obj = {
            template: 'simply_select_tech_specs_management',
            section: 'load_add_category',
            data_obj: full_obj,
            title: 'Add Tech Spec Category',
            buttons: [{
                color: 'green',
                text: 'Save',
                callback: 'toolbox.simply_select.tech_specs_management.addTechSpecCategory'
            },
                {
                    color: 'gray',
                    text: 'Cancel',
                    callback: ''
                }]
        };

        toolbox.modal.renderModal(modal_obj);

    });

    // On click of a category show/hide fields
    $('#tsm_tech_spec_category_container').find('.recursive-list-row[depth|="tech_spec_category"]').live('click', function (event) {

        if (event.target != this) {
            return true;
        }

        // remove highlight from all categories
        $('.recursive-list-row', '#tsm_tech_spec_category_container').removeClass('list-row-green');
        // add highlight to this category
        $(this).addClass('list-row-green');

        var cat_id = $(this).attr('tech_spec_category_id');
        //set active cat id
        active_category_id = cat_id;
        //hide all field containers
        $('.recursive-child-container', '#tsm_right').addClass('hidden');
        //show related fields only
        $('[tech_spec_category_id="' + cat_id + '"]', '#tsm_right').parent('ul').removeClass('hidden');
    });

    //on click eidt a category
    $('.recursive-list-row[depth|="tech_spec_category"]', '#tsm_tech_spec_category_container').find('.icon-edit').live('click', function () {

        var tech_spec_category_id = $(this).parent().parent().attr('tech_spec_category_id');
        var tech_spec_category_name = $(this).parent().parent().attr('tech_spec_category_name');

        var full_obj = {
            'tech_spec_category_id': tech_spec_category_id,
            'tech_spec_category_name': tech_spec_category_name
        };

        var modal_obj = {
            template: 'simply_select_tech_specs_management',
            section: 'load_add_category',
            data_obj: full_obj,
            title: 'Add Tech Spec Category',
            buttons: [{
                color: 'green',
                text: 'Save',
                callback: 'toolbox.simply_select.tech_specs_management.editTechSpecCategory'
            },
                {
                    color: 'gray',
                    text: 'Cancel',
                    callback: ''
                }]
        };

        toolbox.modal.renderModal(modal_obj);
    });

    //on click add a field to a category
    $('.recursive-list-row[depth|="tech_spec_category"]', '#tsm_tech_spec_category_container').find('.icon-add').live('click', function () {

        var tech_spec_category_id = $(this).parent().parent().attr('tech_spec_category_id');

        var params = {action: 'get_tech_spec_field_type_list'};

        function handler(data_obj) {


            var full_obj = {
                'tech_spec_field_type_list': data_obj,
                'tech_spec_category_id': tech_spec_category_id
            };

            var modal_obj = {
                template: 'simply_select_tech_specs_management',
                section: 'load_add_edit_fields',
                data_obj: full_obj,
                title: 'Add Tech Spec Field',
                buttons: [{
                    color: 'green',
                    text: 'Save',
                    callback: 'toolbox.simply_select.tech_specs_management.addTechSpecField'
                },
                    {
                        color: 'gray',
                        text: 'Cancel',
                        callback: ''
                    }],
                margin: {top: '50px', bottom: 0, left: 'auto', right: 'auto'}
            };

            toolbox.modal.renderModal(modal_obj);

        }

        return toolbox.ajax(params, handler);
    });

    //on click edit a field
    $('.list-row[depth|="tech_spec_field"]', '#tsm_tech_spec_category_container').find('.icon-edit').live('click', function () {

        var tech_spec_field_id  = $(this).parent().parent().attr('tech_spec_field_id');

        var params = {
            action: 'load_edit_tech_spec_field',
            data: {'tech_spec_field_id': tech_spec_field_id}
        };

        function handler(data_obj) {

            var modal_obj = {
                template: 'simply_select_tech_specs_management',
                section: 'load_add_edit_fields',
                data_obj: data_obj,
                title: 'Edit Tech Spec Field',
                margin: {
                    top: '50px',
                    right: 'auto',
                    bottom: '0px',
                    left: 'auto'
                },
                buttons: [{
                    color: 'green',
                    text: 'Save',
                    callback: 'toolbox.simply_select.tech_specs_management.editTechSpecField'
                },
                    {
                        color: 'gray',
                        text: 'Cancel',
                        callback: ''
                    }]
            };

            toolbox.modal.renderModal(modal_obj);

            // select the field type that is set and disable it
            var tech_spec_field_type = data_obj.tech_spec_field_type;
            $('#form_tech_spec_field_type option').attr('selected', false);
            $('#form_tech_spec_field_type > option[value="' + tech_spec_field_type + '"]').attr('selected', true);
            $('#form_tech_spec_field_type').attr('disabled', 'disabled');

            // Show unit if type value
            if (tech_spec_field_type == 'Value') {
                $('#tsm_display_value_unit').removeClass('hidden');
                $('#form_tech_spec_field_unit').attr('required', 'required');
            }
            else {
                $('#tsm_display_value_unit').addClass('hidden');
                $('#form_tech_spec_field_unit').removeAttr('required');
            }

            // show options if the right type is selected
            if ($('#form_tech_spec_field_type').val() == 'Single Select' || $('#form_tech_spec_field_type').val() == 'Multi Select') {
                $('#tsm_add_options_container').removeClass('hidden');
                $('#form_tech_spec_options_selected').attr('required', 'required');
            }
            else {
                $('#tsm_add_options_container').addClass('hidden');
                $('#form_tech_spec_options_selected').removeAttr('required');
            }

            //update hidden field to have count of options
            if ($('.list-row', '#tsm_tech_specs_options_container').length > 0) {
                $('#form_tech_spec_options_selected').val($('.list-row', '#tsm_tech_specs_options_container').length);
            }
            else {
                $('#form_tech_spec_options_selected').val('');
            }

        }

        return toolbox.ajax(params, handler);

    });

    //on click delete a category
    $('.recursive-list-row[depth|="tech_spec_category"]', '#tsm_tech_spec_category_container').find('.icon-delete').live('click', function (event) {

        var tech_spec_category_id = $(this).parent().parent().attr('tech_spec_category_id');
        var data_collection = {
            hidden_inputs: [{
                input_id: 'tech_spec_category_id',
                input_value: tech_spec_category_id
            }]
        };

        var modal_obj = {
            template: 'toolbox_modal',
            section: 'delete_modal',
            data_obj: data_collection,
            title: 'Delete Tech Spec Category',
            buttons: [{
                color: 'red',
                text: 'Delete',
                callback: 'toolbox.simply_select.tech_specs_management.deleteTechSpecCategory'
            },
                {
                    color: 'gray',
                    text: 'Cancel',
                    callback: ''
                }]
        };

        toolbox.modal.renderModal(modal_obj);

        event.stopPropagation();

    });

    //on click delete a field
    $('.list-row[depth|="tech_spec_field"]', '#tsm_tech_spec_category_container').find('.icon-delete').live('click', function (event) {

        var tech_spec_field_id = $(this).parent().parent().attr('tech_spec_field_id');

        var data_collection = {hidden_inputs: [{input_id: 'tech_spec_field_id', input_value: tech_spec_field_id}]};

        var modal_obj = {
            template: 'toolbox_modal',
            section: 'delete_modal',
            data_obj: data_collection,
            title: 'Delete Tech Spec Field',
            buttons: [{
                color: 'red',
                text: 'Delete',
                callback: 'toolbox.simply_select.tech_specs_management.deleteTechSpecField'
            },
                {
                    color: 'gray',
                    text: 'Cancel',
                    callback: ''
                }]
        };

        toolbox.modal.renderModal(modal_obj);

        event.stopPropagation();

    });

    //show/hide options if they are needed
    $('#form_tech_spec_field_type').live('change', function () {

        if ($(this).val() == 'Single Select' || $(this).val() == 'Multi Select') {
            $('#tsm_add_options_container').removeClass('hidden');
            $('#form_tech_spec_options_selected').attr('required', 'required');
        }
        else {
            $('#tsm_add_options_container').addClass('hidden');
            $('#form_tech_spec_options_selected').removeAttr('required');
        }

        if ($(this).val() == 'Value') {
            $('#tsm_display_value_unit').removeClass('hidden');
            $('#form_tech_spec_field_unit').attr('required', 'required');
        }
        else {
            $('#tsm_display_value_unit').addClass('hidden');
            $('#form_tech_spec_field_unit').removeAttr('required');
        }

    });

    //on click of add tech spec Option button add it
    $(document).on('click', '#tsm_add_tech_spec_option', function () {

        $('.form-status[association|="form_tech_spec_options_selected"]').addClass('hidden');

        var option = $('#form_tech_spec_option').val();
        var name_check = 0;

        $('.list-row', '#tsm_tech_specs_options_container').each(function () {

            if ($(this).attr('tech_spec_option_name') == option) {
                name_check = 1;
            }

        });

        if (option != '' && name_check == 0) {

            var last_option = '';

	        var source = $('#simply_select_tech_specs_management').html();
			var template = Handlebars.compile(source);

			// prepare the html for the new option
			var new_option = template({
				'data_obj': [{tech_spec_option_id:'',
							tech_spec_option_name:option
				}],
				'prepare_tech_spec_option_item': 1
			});

            // add the new option in alphabetical order
            option = option.toLowerCase();

            $('.list-row', '#tsm_tech_specs_options_container').each(function () {
                var cur_option = $(this).attr('tech_spec_option_name').toLowerCase();

                if (cur_option < option) {
                    last_option = $(this);
                }
            });

            if (last_option != '') {
                last_option.after(new_option);
            }
            else {

                var option_count = $('.list-row', '#tsm_tech_specs_options_container').length

                if (option_count == 0) {
                    $('#tsm_tech_specs_options_container').append(new_option);
                }
                else {
                    var first_option_div = $('.list-row', '#tsm_tech_specs_options_container').first();
                    first_option_div.before(new_option);
                }
            }

            //remove value as selected value
            $('#form_tech_spec_option').val('');

            //update hidden field to have count of options
            if ($('.list-row', '#tsm_tech_specs_options_container').length > 0) {
                $('#form_tech_spec_options_selected').val($('.list-row', '#tsm_tech_specs_options_container').length);
            }
            else {
                $('#form_tech_spec_options_selected').val('');
            }
        }
        else {

            $('.form-status[association|="form_tech_spec_options_selected"]').removeClass('hidden');
        }

    });

    //On click of delete icon remove tech spec option
    $('.icon-delete', '#tsm_tech_specs_options_container').live('click', function () {
        $(this).parent().parent().empty().remove();
    });

    //On finished sorting save state
    $('.recursive-child-container', '#tsm_tech_spec_category_container').live('sortstop', function (event, ui) {

        var field_order = new Array();

        $(this).children('li').each(function () {
            field_order.push($(this).attr('tech_spec_field_id'));
        });

        var params = {
            action: 'edit_tech_spec_field_order',
            data: {'tech_spec_field_order': field_order + ''}
        };

        function handler(data_obj) {
        }

        return toolbox.ajax(params, handler);

    });
}