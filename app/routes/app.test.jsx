import {
  Page,
  FormLayout,
  Box,
  TextField,
  Button,
  Card,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import axios from "axios";
import { Form, useActionData, useSubmit, useNavigate } from "@remix-run/react";

export async function action({ request }) {
  const body = await request.formData();
  const rawData = {
    USERNAME: body.get("email"),
    PASSWORD: body.get("password"),
  };

  const loginResponse = await axios.post(
    "https://partner.viettelpost.vn/v2/user/Login",
    rawData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    }
  );
  return loginResponse.data;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  useEffect(() => {
    if (token) {
      alert("Login Success!!!");

      navigate("/app");
    }
  }, [token]);

  const loginResponse = useActionData();
  const submit = useSubmit();
  const handleLogin = async () => {
    try {
      // submit({}, { replace: true, method: "POST" });
      // console.log(loginResponse);
      if (loginResponse?.error) {
        console.log(loginResponse?.message);
      } else {
        console.log("Token=>", loginResponse?.data?.token);
        setToken(loginResponse?.data?.token);
        localStorage.setItem("token", loginResponse?.data?.token);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <Page>
      <ui-title-bar title="Login" />
      <Card>
        <FormLayout>
          <Form method="post" onSubmit={handleLogin}>
            <TextField
              label="Email:"
              name="email"
              placeholder="Email or Phone Number"
              value={email}
              type="email"
              onChange={(value) => {
                setEmail(value);
              }}
              autoComplete="off"
            />
            <TextField
              label="Password:"
              name="password"
              placeholder="Password"
              value={password}
              type="password"
              onChange={(value) => {
                setPassword(value);
              }}
              autoComplete="off"
            />
            <br />
            <Button submit textAlign="center" destructive>
              Login
            </Button>
          </Form>
        </FormLayout>
      </Card>
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
