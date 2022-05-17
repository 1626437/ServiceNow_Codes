var Integration = Class.create();
Integration.prototype = {
	initialize: function () {
	},
	put: function (structure) {
		
		var integration = new GlideRecord('u_integration');
		
		integration.initialize();
		
		integration.u_address = structure.request.address;
		integration.u_http_method = structure.request.http_method;
		integration.u_request_headers = structure.request.headers;
		integration.u_request_payload = structure.request.payload;
		integration.u_date_of_request = structure.request.date;
		
		
		integration.u_http_status_code = structure.response.http_status_code;
		integration.u_response_headers = structure.response.headers;
		integration.u_response_payload = structure.response.payload;
		integration.u_date_of_response = structure.response.date;
		
		integration.u_integration_name = structure.integration.name;
		integration.u_integration_service = structure.integration.service;
		
		integration.insert();
	},
	type: 'Integration'
};