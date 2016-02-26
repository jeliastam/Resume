$(function(){
    if(toolbox){
        toolbox.simply_select.product_images = new ProductImages();
    }    
});

function ProductImages(){
    this.loadPage                = loadPage;
    this.loadPreset = loadPreset;
    this.getCanonical = getCanonical;
    this.changeProduct           = changeProduct;
    this.loadSwatchManagement    = loadSwatchManagement;
    this.loadProductImages       = loadProductImages;
    this.loadImageShotManagement = loadImageShotManagement;
    this.removeImageShot         = removeImageShot;
    this.updateClientSettings    = updateClientSettings;
	this.deleteProductImage      = deleteProductImage;
	this.deleteProductSwatch     = deleteProductSwatch;
    var client_settings = {};

    function loadPage(return_obj){
		
    	var source = $("#simply_select_product_images").html();
        var template = Handlebars.compile(source);

        $('#content_container').html(template({
        	'data_obj'              : return_obj,
        	'load_product_images'   :'1',
        	'page_title'            : $('.sidebar-link-selected').html()
        }));

        if (toolbox.selected_language_id) {
            $('#pi_language_select').val(toolbox.selected_language_id).change();
        }

        if (toolbox.selected_client_id      &&
            toolbox.selected_product_id     &&
            toolbox.selected_manufacturer_id) {

        	changeProduct();
		}
    }

    // Has a specific client / product_id been requested?
    function loadPreset(pageparam) {
        
        function handler(modal_obj){
            toolbox.selected_client_product_id     = modal_obj.client_product_id;
            toolbox.selected_product_id            = modal_obj.product_type_id;
            toolbox.selected_product_name          = modal_obj.product_type_name;
            toolbox.selected_language_id           = modal_obj.language_id;
            toolbox.selected_language_name         = modal_obj.language_name;
            toolbox.selected_client_id             = modal_obj.client_id;
            toolbox.selected_client_name           = modal_obj.client_name;

            return changeProductType();
        }
        
        var params = {
                module: 'simply_select',
                action: 'get_scoring_question_header',
                data: { client_product_type_id: pageparam[1],
                        language_id: pageparam[2]
                }
            };

        toolbox.selected_client_product_id = 0;        // prevent loadPage from auto-loading any data

        return toolbox.ajax(params, handler);
    }
    
    function getCanonical(action_name) {
        var res = '/prduct_images';

        if (toolbox.selected_client_id > 0) {
            res += '/' + toolbox.selected_client_id;
            if (toolbox.selected_client_product_id) {
                res += '/' + toolbox.selected_client_product_id;
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
    
    //change the selected product
    function changeProduct(){

        toolbox.product_selected = true;
    	
		$('#pi_product_name').html(
			toolbox.selected_client_name + ' - ' +
			toolbox.selected_manufacturer_name + ' - ' +
			toolbox.selected_product_name
		);

		if (toolbox.selected_language_id) {
    		loadProductImages();
    	}
    	
    }
    
    //load the images for a product/client combination
    function loadProductImages(){
    	
    	var params = {
                module  : 'simply_select',
                action  : 'get_product_images',
                data    : {
                    client_id           : toolbox.selected_client_id,
                    client_product_id   : toolbox.selected_client_product_id,
                    manufacturer_id     : toolbox.selected_manufacturer_id,
                    language_id         : toolbox.selected_language_id
                }
            };
        	
    	function handler(data_obj){

    		var image_list_empty = 0;
    		var swatch_list_empty = 0;
    		
    	 	if(jQuery.isEmptyObject(data_obj.product_images)){
    	 		image_list_empty = 1;
        	}

            if(jQuery.isEmptyObject(data_obj.product_swatches)){
    	 		swatch_list_empty = 1;
        	}

            // maybe check something first before trying to set this....
            client_settings = data_obj.client_settings;
            checkForRequiredSettings();

    		var source   = $("#simply_select_product_images").html();
	        var template = Handlebars.compile(source);

	        $('#pi_product_images_container').html(template({
                'load_product_images_list'  : 1,
	        	'data_obj'                  : data_obj,
	        	'image_list_empty'          : image_list_empty,
	        	'swatch_list_empty'         : swatch_list_empty,
                client_id                   : toolbox.selected_client_id,
                client_product_id           : toolbox.selected_client_product_id,
                client_settings             : client_settings
	        }));

        }
        
        return toolbox.ajax(params, handler);
    }

    function checkForRequiredSettings() {
        if (client_settings !== null && client_settings.product_image_image_required) {
            if (!client_settings.product_image_image_width || !client_settings.product_image_image_height ) {
                $('#pi_edit_client_settings_button').addClass('red');
            }
        } else {
            $('#pi_edit_client_settings_button').removeClass('red');
        }
    }

    //load the product swatch modal
    function loadSwatchManagement(){
    	
		// retrieve all swatches for all manufacturers - but only display selected manufacturer
        // why??
    	var params = {
            module: 'simply_select',
            action: 'get_product_swatches',
            data: {
                    'manufacturer_id'   : toolbox.selected_manufacturer_id,
                    'client_id'         : toolbox.selected_client_id,
                    'language_id'       : toolbox.selected_language_id
            }
        };
		
		function handler(data_obj){
			
			var modal_obj = {
				template: 'simply_select_product_images',
				section: 'load_swatch_management',
				title: 'Manage Swatches',
				data_obj: data_obj,
				margin: {top: '50px',
				         right: 'auto',
				         bottom: '0px',
				         left: 'auto'
				        },
				buttons: [{color: 'gray',
						   text: 'Close',
					 	   callback: 'toolbox.simply_select.product_images.loadProductImages'
				    	 }],
				size: {width:'400px'},
                context: '#pi_swatch_container'
			};
			
			toolbox.modal.renderModal(modal_obj);

            //color picker
            $('#pi_swatch_color').spectrum({
                preferredFormat : "hex",
                showInput       : true
            });


            $('#pi_manufacturer_id').val(toolbox.selected_manufacturer_id).change();
		}
		
		return toolbox.ajax(params, handler);
    }

    // add a swatch to the selected product
    function mapSwatchToProduct(product_swatch_id) {
        var params = {
            module: 'simply_select',
            action: 'add_product_swatch_to_product',
            data: {
                client_product_id : toolbox.selected_client_product_id,
                product_swatch_id : product_swatch_id
            }
        };

        function handler(data_obj){

			var msg = 'Unable to assign Swatch, it may already be assigned to this product.';
			if (data_obj.product_product_swatch_id == -1) {
				data_obj.product_product_swatch_id = 0;
				var msg = 'Please select a Swatch';
			}
            if(data_obj.product_product_swatch_id != 0){
                loadProductImages();
            } else {

                var modal_obj = {
                    template    : 'toolbox_modal',
                    section     : 'error_modal',
                    data_obj    : {
                        'error_message' : msg
                    },
                    title       : 'Error',
                    buttons     : [{
                        color    : 'gray',
                        text     : 'Close',
                        callback : ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);
            }
        }

        return toolbox.ajax(params, handler);
    }

    function loadImageShotManagement() {
        var params = {
            module  : 'simply_select',
            action  : 'load_image_shot_management',
            data    : {
                client_product_id    : toolbox.selected_client_product_id,
                language_id          : toolbox.selected_language_id
            }
        };

        function handler(return_obj) {

            var modal_obj = {
                template: 'simply_select_product_images',
                section: 'load_image_shot_management',
                title: 'Edit Image Shots',
                data_obj: return_obj,
                margin: {top: '50px',
                    right: 'auto',
                    bottom: '0px',
                    left: 'auto'
                },
                buttons: [
                    {
                        color    : 'gray',
                        text     : 'Close',
                        callback : ''
                    }],
                size: { width:'500px' }
            };

            toolbox.modal.renderModal(modal_obj);
        }

        return toolbox.ajax(params, handler);
    }

    function addOrUpdateImageShot() {
        var params = {
            module  : 'simply_select',
            action  : 'add_update_image_shot',
            data    : {
                client_id       : toolbox.selected_client_id,
                product_id      : toolbox.selected_product_id,
                language_id     : toolbox.selected_language_id,
                image_shot_name : $('#pi_modal_image_shot_name_field').val(),
                image_shot_id   : $('#pi_modal_image_shot_name_field').attr('product_image_shot_id') || 0
            }
        };

        function handler(return_obj) {
            if (return_obj) {

                loadImageShotManagement();

                loadProductImages();

            } else {

                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'Unable to create Image Shot, it may already exist.'},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: 'toolbox.simply_select.product_images.loadImageShotManagement'
                    }]
                };

                toolbox.modal.renderModal(modal_obj);
            }
        }

        return toolbox.form.validateForm(params, handler);
    }

    function createProductSwatch() {
        var swatch_name         = $('#pi_swatch_name').val();
        var swatch_color        = $('#pi_swatch_color').val().substr(1);

        var params = {
            module: 'simply_select',
            action: 'add_product_swatch',
            data: {
                manufacturer_id    : toolbox.selected_manufacturer_id,
                client_id          : toolbox.selected_client_id,
                language_id        : toolbox.selected_language_id,
                swatch_name        : swatch_name,
                swatch_color       : swatch_color
            }
        };

        function handler(data_obj){

            if (data_obj.product_swatch_id != 0) {

                loadSwatchManagement();

                loadProductImages();

            } else {

                var modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'Unable to create Swatch, it may already exist.'},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: 'toolbox.simply_select.product_images.loadSwatchManagement'
                    }]
                };

                toolbox.modal.renderModal(modal_obj);
            }
        }

        toolbox.ajax(params, handler);
    }

    function removeImageShot(modal_obj) {

        var params = {
            module  : 'simply_select',
            action  : 'remove_product_image_shot',
            data    : {
                client_id               : toolbox.selected_client_id,
                client_product_id       : toolbox.selected_client_product_id,
                language_id             : toolbox.selected_language_id,
                product_image_shot_id   : modal_obj.selected_image_shot_id
            }
        };

        function handler (data_obj) {
            loadProductImages();
            loadImageShotManagement();
        }

        return toolbox.ajax(params, handler);

    }

    function loadEditClientSettings() {
        var params = {
            module  : 'simply_select',
            action  : 'load_edit_client_settings',
            data    : {
                client_id : toolbox.selected_client_id
            }
        };

        function handler(return_obj) {
            var modal_obj = {
                template: 'simply_select_product_images',
                section: 'edit_client_settings_modal',
                data_obj: return_obj,
                title: 'Edit Client Settings',
                buttons: [{
                    color: 'green',
                    text: 'Save',
                    callback: 'toolbox.simply_select.product_images.updateClientSettings'
                },
                    {
                        color: 'gray',
                        text: 'Cancel',
                        callback: ''
                    }],
                size: {height: '', width: '500px'},
                context: '#modal_window'
            };

            toolbox.modal.renderModal(modal_obj);

            if (toolbox.selected_client_id) {
                $('#pi_client_settings_client_select').val(toolbox.selected_client_id).change();
            }
        }

        return toolbox.ajax(params, handler);
    }

    function populateEditClientSettings() {
        var params = {
            module  : 'simply_select',
            action  : 'get_client_settings',
            data    : {
                client_id : toolbox.selected_client_id
            }
        };

        function handler(return_obj) {
            var list_empty = 0;

            if (!return_obj) {
                list_empty = 1;
            }

            var source = $("#simply_select_product_images").html();
            var template = Handlebars.compile(source);

            $('#pi_client_settings_container').html(template({
                populate_client_settings  : 1,
                list_empty                : list_empty,
                data_obj                  : return_obj
            }));
        }

        return toolbox.ajax(params, handler);
    }

    function updateClientSettings(data) {

        var params = {
            module  : 'simply_select',
            action  : 'update_client_settings',
            data    : {
                client_id                       : data['pi_client_settings_client_select'],
                top_feature_count               : client_settings.top_feature_count,
                top_feature_char_limit          : client_settings.top_feature_character_limit,
                top_feature_image_required      : client_settings.top_feature_image_required,
                top_feature_image_width         : client_settings.top_feature_image_width,
                top_feature_image_height        : client_settings.top_feature_image_height,
                product_image_image_required    : data['pi_client_settings_image_required'] ? 1 : 0,
                product_image_image_width       : data['pi_client_settings_image_required'] ? data['pi_client_settings_image_width']  : null,
                product_image_image_height      : data['pi_client_settings_image_required'] ? data['pi_client_settings_image_height'] : null,

            }
        };

        function handler(return_obj) {
            var modal_obj = {};

            if (!return_obj) {
                modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': 'Client settings could not be saved.'},
                    title: 'Error',
                    buttons: [{color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);
            } else if (toolbox.product_selected && toolbox.selected_language_id) {
                loadProductImages();
            }
        }

        return toolbox.ajax(params, handler);
    }
	
	function deleteProductImage(modal_obj) {
    	var params = {
            module: 'simply_select',
            action: 'delete_product_image',
            data: {	product_product_image_shot_id: modal_obj.product_product_image_shot_id,
					client_product_id   : toolbox.selected_client_product_id,
					authentication: modal_obj.authentication}
        };

    	function handler(return_obj){ 
			
    		var client_id = $('#pi_select_client').val();
    		loadProductImages(client_id, toolbox.selected_product_id);
    	}

    	return toolbox.ajax(params, handler);

	}
	
    //delete a manufacturer swatch
	function deleteColorSwatch(modal_obj) {
    	
    	var product_swatch_id = modal_obj.product_swatch_id;
    	var used_count = modal_obj.used_count;
    	
		error =	 used_count > 0;
    	if(!error){
	    	
	    	var params = {
                module  : 'simply_select',
                action  : 'delete_product_swatch',
                data    : {
                    'product_swatch_id' : product_swatch_id
                }
            };
	
			function handler(data_obj){
					
				if(data_obj.success == 1){
					loadSwatchManagement();
				} else{
        			error = true;
        		}
		    }
			
			return toolbox.ajax(params, handler);
    	}
		
    	if(error){
    	
			modal_obj = {
    				template: 'toolbox_modal',
    				section: 'error_modal',
    				data_obj: {'error_message': 'Unable to delete Swatch, it may be in use.'},
    				title: 'Error',
    				buttons: [{color: 'gray',
    	    				   text: 'Close',
    	    			 	   callback: 'toolbox.simply_select.product_images.loadSwatchManagement'
    				    	 }]
    			};
    	    	
    	    toolbox.modal.renderModal(modal_obj);
    	}
	}

    //delete a product swatch
	function deleteProductSwatch(modal_obj) {

    	var params = {module: 'simply_select',
	                  action: 'delete_prouct_swatch_from_product',
	                  data: {'product_product_swatch_id': modal_obj.product_product_swatch_id}
	        		 };

		function handler(data_obj){
			
			var client_id = $('#pi_select_client').val();
			
			loadProductImages();
	    }
		
		return toolbox.ajax(params, handler);
 	}
    
    /*******************************
     * Event Handlers *
     *******************************/

    // handler for client select in client settings modal
    $(document).on('change', '#pi_client_settings_client_select', function() {
        var newValue = $(this).val();
        if (newValue) {
            toolbox.selected_client_id = newValue;
            populateEditClientSettings();
        }
    });

    // handler for client settings edit icon
    $(document).on('click', '#pi_edit_client_settings_button', function() {
        loadEditClientSettings();
    });

    // click on image shot name in image shot management
    $(document).on('click', '#pi_modal_image_shots_container div.list-row', function(event) {
        // still allow clicking on the delete icon
        event.stopPropagation();

        var $this                   = $(this);
        var product_image_shot_name = $this.attr('product_image_shot_name');
        var product_image_shot_id   = $this.attr('product_image_shot_id');

        // set all back to unhighlighted then highlight $this
        $this.parent().children().removeClass('list-row-green');
        $this.addClass('list-row-green');

        // update input with values for update function to grab
        $('#pi_modal_image_shot_name_field').val(product_image_shot_name).attr('product_image_shot_id', product_image_shot_id);

        // change button to save instead of add - bad idea?
        $('#pi_modal_add_update_image_shot').text('Update');
    });

    // click delete icon on image shot in image shot management
    $(document).on('click', '#pi_modal_image_shots_container .icon-delete', function(event) {
        //stop bubbling up to parent
        event.stopPropagation();

        var selected_image_shot_id  = $(this).parents().eq(1).attr('product_image_shot_id');

        var modal_obj = {
            template: 'toolbox_modal',
            section: 'delete_modal',
            data_obj: {hidden_inputs: [{input_id: 'selected_image_shot_id', input_value: selected_image_shot_id}]},
            title: 'Delete Image Shot',
            buttons: [{
                    color: 'gray',
                    text: 'Cancel',
                    callback: 'toolbox.simply_select.product_images.loadIconShotManagement'
                },
                {
                    color: 'red',
                    text: 'Delete',
                    callback: 'toolbox.simply_select.product_images.removeImageShot'
                }],
            context: '#modal_window'
        };

        toolbox.modal.renderModal(modal_obj);

    });

    // click 'add' in edit image shots modal
    $(document).on('click', '#pi_modal_add_update_image_shot', function(event) {
        $('[association="pi_image_shot_name"]').addClass('hidden');

        var new_image_shot_name = $('#pi_modal_image_shot_name_field').val();
        var $image_shot_list    = $('.list-row', '#pi_modal_image_shots_container');
        var image_shot_names    = $image_shot_list.map(function() { return $(this).attr('product_image_shot_name'); }).get();

        console.log(image_shot_names);

       if (new_image_shot_name != '' && image_shot_names.indexOf(new_image_shot_name) == -1) {
           addOrUpdateImageShot();
       } else {
           $('[association="pi_image_shot_name"]').removeClass('hidden');
       }
    });

    // click 'edit image shots'
    $(document).on('click', '#pi_image_shot_edit', function(event) {
       loadImageShotManagement();
    });

    // language selection change
    $(document).on('change', '#pi_language_select', function() {
        var newValue = $(this).val();

		if (newValue) {
            toolbox.selected_language_id = newValue;
            if (toolbox.product_selected) {
                loadProductImages();
            }
		}
    });

    //delete selected image filw
    $(document).on('click', '#pi_product_product_images_container .icon-delete', function(event){
		var product_product_image_shot_id = $(this).attr('product_product_image_shot_id');
    	var authentication = $(this).attr('authentication');

		var data_collection = {	hidden_inputs: [{input_id: 'product_product_image_shot_id', input_value: product_product_image_shot_id},
												{input_id: 'authentication', input_value: authentication}]};
		
		var modal_obj = {
				template: 'toolbox_modal',
				section: 'delete_modal',
				data_obj: data_collection,
				title: 'Delete Product Image',
				buttons: [{color: 'red',
						   text: 'Delete',
						   callback: 'toolbox.simply_select.product_images.deleteProductImage'
						  },
						  {color: 'gray',
						   text: 'Cancel',
						   callback: ''
						 }]
			};
		
		toolbox.modal.renderModal(modal_obj);
    });

    // swatch management button clicked
    $(document).on('click', '#pi_swatch_management', function(event){
    	loadSwatchManagement();
    });

    //On click of swatch color
    $(document).on('click', '#pi_swatch_color', function(event){
    	$(this).keyup(function(event) {
    		toolbox.keystrokes.hexOnly(event, $(this).val());
        });
    	event.stopPropagation();
    });

    //create a product swatch
    $(document).on('click', '#pi_add_swatch', function(event) {
        $('[association]').addClass('hidden');
        
        var swatch_color = $('#pi_swatch_color').val();
        var swatch_name  = $('#pi_swatch_name').val();

        if (!swatch_color) {
            $('[association="pi_swatch_color"]').removeClass('hidden');
        }

        if (!swatch_name) {
            $('[association="pi_swatch_name"]').removeClass('hidden');
        }

        if (swatch_color && swatch_name) {
            $('[association="pi_swatch_color"]').addClass('hidden');
            $('[association="pi_swatch_name"]').addClass('hidden');
            createProductSwatch();
        }
    });

    // handler for delete icon
    $(document).on('click', '#pi_swatch_container .icon-delete', function(event){
    	var product_swatch_id = $(this).parent().parent().attr('product_swatch_id');
    	var used_count = $(this).parent().parent().attr('used_count');
		
		// can't use a modal for the confirmation, or the delete -- it's already open
		if (confirm('Are you sure you wish to delete this color swatch?')) {
			var modal = {product_swatch_id: product_swatch_id,
						used_count: used_count};
			deleteColorSwatch(modal);
		}    
    });

    //disassociate a swatch from a product
    $(document).on('click', '#pi_product_product_swatch_container .icon-delete', function(event){

    	var product_product_swatch_id = $(this).parent().parent().attr('product_product_swatch_id');

		var data_collection = {	hidden_inputs: [{input_id: 'product_product_swatch_id', input_value: product_product_swatch_id}]};
		
		var modal_obj = {
				template: 'toolbox_modal',
				section: 'delete_modal',
				data_obj: data_collection,
				title: 'Delete Product Swatch',
				buttons: [{color: 'red',
						   text: 'Delete',
						   callback: 'toolbox.simply_select.product_images.deleteProductSwatch'
						  },
						  {color: 'gray',
						   text: 'Cancel',
						   callback: ''
						 }]
			};
		
		toolbox.modal.renderModal(modal_obj);
    });

    //assign a product swatch to a product
    $('#pi_assign_product_swatch').live('click',function(event){

        var product_swatch_id = $('#pi_select_swatch').val();

        if (product_swatch_id) {
            mapSwatchToProduct(product_swatch_id);
        }
    });
    
    //set shown product swatch
    $('.icon-shown', '#pi_product_product_swatch_container').live('click',function(event){

    	var product_product_swatch_id = $(this).parent().parent().attr('product_product_swatch_id');

    	var params = {module: 'simply_select',
	                  action: 'set_shown_prouct_swatch_for_product',
	                  data: {'product_product_swatch_id': product_product_swatch_id}
	        		 };

		function handler(data_obj){
			
			var client_id = $('#pi_select_client').val();
			
			loadProductImages();
	    }
		
		return toolbox.ajax(params, handler);
    });
    
    
    //file requested to be uploaded
    $('.image_file', '#pi_product_images_container').live('change',function(event){    	
    	
    	$(this).attr('required', 'required');
    	$('.image_file').not(this).empty().remove();
    	
    	var product_image_shot_id = $(this).attr('product_image_shot_id');
    	var json = $(this).serializeJSON();
    	
    	function handler(data_obj){
            var res = JSON.parse(data_obj);

            if (typeof res.error != typeof undefined) {
                modal_obj = {
                    template: 'toolbox_modal',
                    section: 'error_modal',
                    data_obj: {'error_message': res.error.msg},
                    title: 'Error',
                    buttons: [{
                        color: 'gray',
                        text: 'Close',
                        callback: ''
                    }]
                };

                toolbox.modal.renderModal(modal_obj);
            } else {

                file_obj = $.parseJSON(data_obj);
                var client_id = $('#pi_select_client').val();

                var params = {
                    module: 'simply_select',
                    action: 'add_product_image',
                    data: {
                        'client_product_id': toolbox.selected_client_product_id,
                        'product_image_shot_id': product_image_shot_id,
                        'product_image_file_name': file_obj[0].saved_name
                    }
                };

                function handler(return_obj) {

                    if (return_obj.product_product_image_id == 0) {

                        var modal_obj = {
                            template: 'toolbox_modal',
                            section: 'error_modal',
                            data_obj: {'error_message': 'The file was not uploaded.'},
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
                        loadProductImages(client_id, toolbox.selected_product_id);
                    }
                }

                return toolbox.ajax(params, handler);
            }
    	}
    	
    	toolbox.form.validateForm(json, handler);
    });
    
    
    
    //change visible swatches in modal
    $('#pi_manufacturer_id').live('change',function(event){ 
    	
    	var manufacturer_id = $(this).val();
    	
    	if(manufacturer_id != ''){
            // if a manufacturer is selected
            // hide all the swatches and the manufacturer names
	    	$('.list-row, .list-row .hideable', '#pi_swatch_container').hide();
            // show only selected manufacturer swatches without the manufacturer name
	    	$('.list-row[manufacturer_id="'+ manufacturer_id+'"]', '#pi_swatch_container').show();
    	}
    	else{
            //else, show all swatches with manufacturer label
    		$('.list-row, .list-row .hideable', '#pi_swatch_container').show();
    	}
    	
    	if($('.list-row:visible', '#pi_swatch_container').length == 0){
    		$('#pi_no_swatches').show();
    	}
    	else{
    		$('#pi_no_swatches').hide();
    	}
    	
    });	
}