<?php

namespace model\simply_select;

class tech_specs_management extends simply_select
{

    //constructor
    public function __construct($data_arr = null)
    {
        parent::__construct($data_arr);
    }

    //function to get a Tech Spec list by product type
    // if option is  'no_value' then 'Value' items are not included
    public function getTechSpecListByProductType($option = '')
    {

        $company_id = $this->company_id;
//        $client_id = $this->data_arr['client_id'];
        $language_id = $this->data_arr['language_id'];
        $client_product_type_id = $this->data_arr['client_product_type_id'];

        $sql_str = "CALL " . $this->db . ".tech_spec_categoryListByProductType(%d, %d, %d)";

        $result_arr = $this->db_conn->SafeQuery($sql_str, array($client_product_type_id, $language_id, $company_id), 'multi');
		$this->db_conn->checkError();

        $tech_spec_array = array();
        $tech_spec_key = count($tech_spec_array);
        $tech_spec_category = null;
        $tech_spec_field = null;
		

        foreach ((array)$result_arr as $key => $cur_result) {

            if ($cur_result['tech_spec_field_type'] == 'Value' && $option == 'no_value') {
                unset($result_arr[$key]);
                continue;
            }
            //if a new category make a new array key
            if ($cur_result['tech_spec_category_id'] != $tech_spec_category) {
                $tech_spec_key = count($tech_spec_array);
            }

            $tech_spec_array[$tech_spec_key]['tech_spec_category_id'] = $cur_result['tech_spec_category_id'];
            $tech_spec_array[$tech_spec_key]['tech_spec_category_name'] = $cur_result['tech_spec_category_name'];
            $tech_spec_array[$tech_spec_key]['tech_spec_field_count'] = $cur_result['tech_spec_field_count'];

            //only add unique fields
            if ($cur_result['tech_spec_field_id'] != $tech_spec_field &&
                $cur_result['tech_spec_field_id'] != null
            ) {

                $field_arr = array();
                $field_arr['tech_spec_field_id'] = $cur_result['tech_spec_field_id'];
                $field_arr['tech_spec_field_type'] = $cur_result['tech_spec_field_type'];
                $field_arr['tech_spec_field_name'] = $cur_result['tech_spec_field_name'];
                $field_arr['tech_spec_field_unit'] = $cur_result['tech_spec_field_unit'];

                $option_arr = array();

                // sub-loop to get options
                foreach ($result_arr as $key => $option_result) {

                    //only get options for this field
                    if ($option_result['tech_spec_field_id'] == $cur_result['tech_spec_field_id'] &&
                        $option_result['tech_spec_option_id'] != null
                    ) {

                        $option_arr[] = $option_result['tech_spec_option_name'];
                    }
                }

                $field_arr['option'] = implode('<br>', $option_arr);
                $tech_spec_array[$tech_spec_key]['field'][] = $field_arr;

            }

            // remember last category and field
            $tech_spec_category = $cur_result['tech_spec_category_id'];
            $tech_spec_field = $cur_result['tech_spec_field_id'];
        }

        return $tech_spec_array;
    }

    //function to add a tech spec category
    public function addTechSpecCategory()
    {

        $language_id = $this->data_arr['language_id'];
//        $client_id = $this->data_arr['client_id'];
        $client_product_type_id = $this->data_arr['client_product_type_id'];
        $tech_spec_category_name = $this->data_arr['tech_spec_category_name'];
        $created_user_id = $this->user_id;

        $sql_str = "CALL " . $this->db . ".tech_spec_categoryAdd(%d, %d, %s, %d)";

        return $this->db_conn->SafeQuery($sql_str, array($client_product_type_id, $language_id, $tech_spec_category_name, $created_user_id), 'single');
    }

    //function to update a tech spec field
    public function updateTechSpecCategory()
    {

        $tech_spec_category_id = $this->data_arr['tech_spec_category_id'];
        $tech_spec_category_name = $this->data_arr['tech_spec_category_name'];
        $updated_user_id = $this->user_id;

        $sql_str = "CALL " . $this->db . ".tech_spec_categoryUpdate(%d, %s, %d)";

        return $this->db_conn->SafeQuery($sql_str, array($tech_spec_category_id, $tech_spec_category_name, $updated_user_id), 'single');
    }

    //function to delete a tech spec category
    public function deleteTechSpecCategory()
    {
        $tech_spec_category_id = $this->data_arr['tech_spec_category_id'];

        $sql_str = "CALL " . $this->db . ".tech_spec_categoryDelete($tech_spec_category_id)";

        return $this->db_conn->SafeQuery($sql_str, $tech_spec_category_id, 'none');
    }

    //function to get a tech spec field
    public function getTechSpecField()
    {

        $tech_spec_field_id = $this->data_arr['tech_spec_field_id'];

        $sql_str = "CALL " . $this->db . ".tech_spec_fieldGet($tech_spec_field_id)";

        $result_arr = $this->db_conn->SafeQuery($sql_str, $tech_spec_field_id, 'multi');

        $tech_spec_array = array();

        foreach ($result_arr as $key => $cur_result) {

            $tech_spec_array['tech_spec_category_id'] = $cur_result['tech_spec_category_id'];
            $tech_spec_array['tech_spec_field_id'] = $cur_result['tech_spec_field_id'];
            $tech_spec_array['tech_spec_field_name'] = $cur_result['tech_spec_field_name'];
            $tech_spec_array['tech_spec_field_type'] = $cur_result['tech_spec_field_type'];
            $tech_spec_array['tech_spec_field_unit'] = $cur_result['tech_spec_field_unit'];

            //check to make sure there is a field
            if ($cur_result['tech_spec_option_id'] != null) {
                $field_arr = array();
                $field_arr['tech_spec_option_id'] = $cur_result['tech_spec_option_id'];
                $field_arr['tech_spec_option_name'] = $cur_result['tech_spec_option_name'];

                $tech_spec_array['option'][] = $field_arr;
            }

        }

        return $tech_spec_array;
    }

    //function to get a tech spec field
    public function getTechSpecFieldTypeList()
    {
	
		// show fields from tech_spec_field where Field = 'tech_spec_field_type'
        $sql_str = "CALL " . $this->db . ".tech_spec_field_typeList()";			//** tech_spec_field_typeList is looking at wrong database

        $result_arr = $this->db_conn->SafeQuery($sql_str, '', 'multi');

        $list_array = array();
        $type_array = array();

        foreach ($result_arr as $key => $cur_result) {
            $list_array = explode(',', $cur_result['field_type_list']);
			for ($key = 0; $key < count($list_array); $key++) {
				$type_array[$key]['tech_spec_field_type'] = $list_array[$key];
			}
        }

        return $type_array;
    }

    //function to add a tech spec field
    public function addTechSpecField()
    {

        $tech_spec_category_id = $this->data_arr['tech_spec_category_id'];
        $tech_spec_field_type = $this->data_arr['tech_spec_field_type'];
        $tech_spec_field_name = $this->data_arr['tech_spec_field_name'];
        $tech_spec_field_unit = $this->data_arr['tech_spec_field_unit'];
        $tech_spec_field_order = $this->data_arr['tech_spec_field_order'];
        $tech_spec_options = $this->data_arr['tech_spec_options'];
        $created_user_id = $this->user_id;

        $sql_str = "CALL " . $this->db . ".tech_spec_fieldAdd(%d, %s, %s, %s, %d)";

//        printf($sql_str, $tech_spec_category_id, $tech_spec_field_type, $tech_spec_field_name, $tech_spec_field_unit, $created_user_id);

        $result_arr = $this->db_conn->SafeQuery($sql_str, array($tech_spec_category_id, $tech_spec_field_type, $tech_spec_field_name, $tech_spec_field_unit, $created_user_id), 'single');

        $tech_spec_field_id = $result_arr['tech_spec_field_id'];

        if ($tech_spec_field_type != 'Boolean' && $tech_spec_field_type != 'Value') {
            $new_option_list = explode(",", $tech_spec_options);

            foreach ($new_option_list as $add_option) {
                $this->addTechSpecOption($tech_spec_field_id, $add_option);
            }
        }

        return $result_arr;
    }

    //function to update a tech spec field
    public function updateTechSpecField()
    {

        $tech_spec_field_id     = $this->data_arr['tech_spec_field_id'];
        $tech_spec_field_name   = $this->data_arr['tech_spec_field_name'];
        $tech_spec_field_unit   = $this->data_arr['tech_spec_field_unit'];
        $new_option_list        = $this->data_arr['new_tech_spec_options'];

        $sql_str              = "CALL " . $this->db . ".tech_spec_fieldUpdate(%d, %s, %s, %d)";
        $result_update        = $this->db_conn->SafeQuery($sql_str, array($tech_spec_field_id, $tech_spec_field_name, $tech_spec_field_unit, $this->user_id), 'single');
        $result_arr           = [];
        $result_arr['update'] = $result_update;
        unset($result_update);
        $result_arr['delete'] = [];

        $delete_arr = $this->listTechSpecOption($tech_spec_field_id);	// this will be the list of items to be removed
        // delete everything, unless it appears in the new option list.
		foreach($new_option_list as $option_name => $option_id) {
            // todo: what if option_id is set and its not found in $delete_arr?
            if (!empty($option_id)) {
                $id = intval($option_id);

                if (isset($delete_arr[$id])) {
                    unset($delete_arr[$id]);
                    unset($new_option_list[$option_name]);      // whatever remains in new_option_list should be added
                }
            }
		}

        foreach ($new_option_list as $option_name => $option_id) {
            $this->addTechSpecOption($tech_spec_field_id, $option_name);
        }

        $failed_delete_names = [];
        foreach ($delete_arr as $del_option_id => $del_option_name) {
            $res = $this->deleteTechSpecOption($del_option_id);
            if (!$res['success']) {
                array_push($failed_delete_names, $del_option_name);
            }
        }

        if (!empty($failed_delete_names)) {
            $result_arr['delete'] = ['failed' => $failed_delete_names];
        } else {
            $result_arr['delete'] = $res;
        }

        return $result_arr;
    }
	
	private function listTechSpecOption($tech_spec_field_id) {
		$sql = "select tech_spec_option_name,tech_spec_option_id from {$this->db}.tech_spec_option where tech_spec_field_id=%d";

		$list = $this->db_conn->SafeQuery($sql, $tech_spec_field_id, 'multi');
		$result = array();

        if (is_array($list)) {
            foreach ($list as $listitem) {
                $id = $listitem['tech_spec_option_id'];
                $result[$id] = strtolower(trim($listitem['tech_spec_option_name']));
            }
        }
		return $result;
	}

    //function to delete a tech spec field
    public function deleteTechSpecField()
    {
        $tech_spec_field_id = $this->data_arr['tech_spec_field_id'];

        $sql_str = "CALL " . $this->db . ".tech_spec_fieldDelete(%d)";

        $res = $this->db_conn->SafeQuery($sql_str, $tech_spec_field_id, 'single');
		$this->db_conn->checkError();
		return $res;
    }

    //function to add a tech spec field
    private function addTechSpecOption($tech_spec_field_id, $tech_spec_option_name)
    {

        $sql_str = "CALL " . $this->db . ".tech_spec_optionAdd(%d, %s, %d)";

        $res = $this->db_conn->SafeQuery($sql_str, array($tech_spec_field_id, $tech_spec_option_name, $this->user_id), 'single');
		$this->db_conn->checkError();
		return $res;
    }

    //function to delete a tech spec field
    private function deleteTechSpecOption($tech_spec_option_id)
    {

        $sql_str = "CALL " . $this->db . ".tech_spec_optionDelete(%d)";

        $res = $this->db_conn->SafeQuery($sql_str, $tech_spec_option_id, 'single');
		$this->db_conn->checkError();
		return $res;
    }

    //function to update a tech spec field order
    public function updateTechSpecFieldOrder()
    {

        $tech_spec_field_order = $this->data_arr['tech_spec_field_order'];
        $tech_spec_field_order = explode(',', $tech_spec_field_order);

        for ($key = 0; $key < count($tech_spec_field_order); $key++) {

            $sql_str = "CALL " . $this->db . ".tech_spec_fieldUpdateOrder(%d, %d)";
            $this->db_conn->SafeQuery($sql_str, array($tech_spec_field_order[$key], $key), 'none');
			$this->db_conn->checkError();
        }
    }

}