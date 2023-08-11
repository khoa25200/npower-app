import { Page, FormLayout, Box } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import axios from "axios";

export default function CreateViettelPost() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleEmailChange = (value) => {
    setEmail(value);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
  };

  // useEffect(() => {
  //   console.log("Token=>", token);
  //   // localStorage.setItem("token", token);
  //   // window.location.href = "/app";
  // }, [token]);
  const handleLogin = async () => {
    try {
        const rawData = {
        USERNAME: "dangkhoa@navitech.co",
        PASSWORD: "@khoathanh1023A",
      };

      const loginResponse = await axios.post(
        "https://cors-anywhere.herokuapp.com/https://partner.viettelpost.vn/v2/user/Login",
        rawData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // setToken(loginResponse.data.data.token);
      if(loginResponse.data.data.token!==''){
        console.log("Token=>", loginResponse.data.data.token);
        localStorage.setItem("token", loginResponse.data.data.token);
        // window.location.href = "./";
      }

    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <Page>
      <ui-title-bar title="Login" />
      <FormLayout>
        <label>Email:</label>
        <input
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
        />
        <label>PassWord:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        <button variant="primary" onClick={handleLogin}>
          Login
        </button>
      </FormLayout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="1"
      paddingInlineEnd="1"
      background="bg-subdued"
      borderWidth="1"
      borderColor="border"
      borderRadius="1"
    >
      <code>{children}</code>
    </Box>
  );
}
