// @ts-nocheck
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";

import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  List,
  Link,
  DataTable,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query {
        orders(first: 100) {
          edges {
            node {
              createdAt
              subtotalLineItemsQuantity
              totalPrice
              currentSubtotalLineItemsQuantity
              id
              customer {
                displayName
                firstName
                lastName
              }
            }
          }
        }
      }`
  );

  const responseJson = await response.json();

  return json({
    orders: responseJson.data.orders.edges.map((edge) => edge.node),
  });
}

export default function Index() {
  const [orders, setOrders] = useState([]);

  const columns = [
    "Number",
    "Date",
    "Customer",
    "Total",
    "Status",
    "Payment Status",
    "Quantity",
  ];

  const nav = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    if (actionData?.orders) {
      setOrders(actionData.orders);
      console.log("khoa==>", orders);
    }
  }, [actionData]);

  const getOrders = () => submit({}, { replace: true, method: "POST" });
  return (
    <Page>
      <ui-title-bar title="Home Viettel Post">
        <button variant="primary" onClick={getOrders}>
          Get all order
        </button>
      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={columns}
                rows={
                  orders.map((order) => [
                    `#...${order?.id.slice(-4)}`,
                    order?.createdAt,
                    order?.customer?.displayName ||
                     "...",
                    order?.totalPrice + " VNĐ",
                    order?.displayFulfillmentStatus,
                    order?.displayFulfillmentStatus,
                    order?.currentSubtotalLineItemsQuantity,
                  ]) || []
                }
              />
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
