import { json } from "@remix-run/node"; // or cloudflare/deno
import escapeHtml from "escape-html";
import {
  Box,
  Card,
  Layout,
  List,
  Page,
  Text,
  VerticalStack,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { useParams, Link, useLoaderData } from "@remix-run/react";
import axios from "axios";
export async function loader({ request }) {
  const apiUrl = "https://partner.viettelpost.vn/v2/categories/listProvince";
  const res = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
  });



  return res.data;
}
export default function CreateViettelPost() {
  const params = useParams();
  const orderId = params.orderId;
  const responseData = useLoaderData();
  console.log(responseData)
  return (
    <Page>
      <ui-title-bar title={`Create ViettelPost #${orderId}`} />
      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <a
                style={{ textDecoration: "none" }}
                href={`https://admin.shopify.com/store/${
                  shopify.config.shop.split(".")[0]
                }/orders/${orderId}`}
                target="_blank"
              >Edit order: #{orderId}📝</a>
              <TextField
                label="Store name"
                onChange={() => {}}
                autoComplete="off"
              />
              <TextField
                type="email"
                label="Account email"
                onChange={() => {}}
                autoComplete="email"
              />

              <Link to="/app">Back to Home page</Link>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
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
