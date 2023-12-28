import React, { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useHistory } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RestrictedPage = () => {
  const { oktaAuth } = useOktaAuth();
  const history = useHistory();
  const [ahpraNumber, setAhpraNumber] = useState(null);

  useEffect(() => {
    const validateUser = async () => {
      try {
        // Retrieve access token
        const accessToken = oktaAuth.getAccessToken();
        const decodedToken = jwtDecode(accessToken); // Decode the token
        const ahpraNum = decodedToken["ahpra"]; // Replace with the actual key
        setAhpraNumber(ahpraNum); // Set the state
        if (!ahpraNum) {
            await oktaAuth.signOut();
            return;
          }
          else {
        const response = await fetch(
          "https://uui498as1h.execute-api.ap-southeast-1.amazonaws.com/prod/v1/au/validation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ahpra_number: ahpraNum,
              client_id: "IGUE6DJRNIW664F3",
              redirect_uri: "https://jnjiefprod.azurewebsites.net/",
              reference: "",
              _home_address: "",
              state: "1234",
            }),
          }
        );

        console.log("response>>" + JSON.stringify(response));
        const data = await response.json();

        // Handle response and redirect
        if (data.code !== 200 || data.message !== "success") {
          await oktaAuth.signOut();
          history.push("/error");
        } else {
          history.push("/");
        }
      } 
    }
    catch (error) {
        console.error("Validation error:", error);
        
        await oktaAuth.signOut();
        if (history) {
          // revoke token
          // invalidate session
          //redirect to login page
          await oktaAuth.signOut();
          history.push("/error"); // Redirect to an error page
        } else {
          console.error("History object is undefined");
        }
      }
    };

    validateUser();
  }, [oktaAuth, history]);

  return <div>Additional validation is in progress, please wait.</div>;
};

export default RestrictedPage;
