// @ts-nocheck
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import axios from "axios";
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
    "Print",
  ];

  const [token, setToken] = useState("eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwMzI2MTIzMzk3IiwiVXNlcklkIjoxMzEzNTAyMCwiRnJvbVNvdXJjZSI6NSwiVG9rZW4iOiJPNjNZT1hDQ1ZLQk9SNEdOUEoiLCJleHAiOjE2OTE3NDc0NjksIlBhcnRuZXIiOjEzMTM1MDIwfQ.lgNB5ZrYAF4-FDk7KfMowVxxOzVZOzvdxzhPXLtnkaVlkYuVydP7GxKV-m_OKmXRwjDy-MXGbti1b11yTq3JfA");

  // setToken(localStorage.getItem("token"));

  const [ordersV, setOrdersV] = useState({});
  const [linkPrintV, setLinkPrintV] = useState({});
  const nav = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    if (actionData?.orders) {
      setOrders(actionData.orders);
      // console.log("khoa==>", orders);
    }
  }, [actionData]);

  useEffect(() => {
    console.log("List of orders from Viettel Post: =>", ordersV);
  }, [ordersV]);
  useEffect(() => {
    console.log("data have link print: =>", linkPrintV);
  }, [linkPrintV]);

  const getOrders = () => submit({}, { replace: true, method: "POST" });

  const printViettel = (id) => {
    console.log("print=> ", id);
    if ((token, ordersV)) {
      getLinkPrintViettel(ordersV[1]?.ORDER_NUMBER);
    }
  };

  const createViettel = (id) => {
    console.log("create=>", id);
    // must be have token

    // get orders on viettel post

    if (token) {
      getOrdersViettel({
        TYPE: 0,
        INVENTORY: -1,
        ORDER505: -1,
        STATUS:
          "-100,-101,-102,-108,-109,-110,100,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570",
        DATE_TO: "10/08/2023",
        DATE_FROM: "28/07/2023",
        PAGE_INDEX: 1,
        PAGE_SIZE: 10,
        OTHER_PROPERTIES: "",
        ORDER_PAYMENT: "",
        REASON_RETURN: null,
        deviceId: "n99xapd6xyonzztnsfh9w",
      });
    } else {
      // window.location.href = "/login";
    }

    // get address

    // Get category store information

    // price information

    // get order information + create order viettel post
  };

  const getOrdersViettel = async (payload) => {
    try {
      const response = await axios.options(
        "https://cors-anywhere.herokuapp.com/https://api.viettelpost.vn/api/supperapp/orderByStatusWeb"
      );

      // Xác minh rằng yêu cầu preflight đã trả về trạng thái OK
      if (response.status !== 200) {
        console.log("Preflight request failed.");
        return;
      }
      console.log("getting orders...");
      const ordersResponse = await axios.post(
        "https://cors-anywhere.herokuapp.com/https://api.viettelpost.vn/api/supperapp/orderByStatusWeb",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            token: "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwOTE4NDE0ODQ4IiwiVXNlcklkIjo2NzMyMTMyLCJGcm9tU291cmNlIjo1LCJUb2tlbiI6IkVRUkVRSVpNWkhLVFVYTDgiLCJleHAiOjE2OTE3NDg0MzAsIlBhcnRuZXIiOjY3MzIxMzJ9.z4Ymv4PFsRw1oK1OdPeJBD0CuiUukQmjy4UqYLU5EOqr0KLtllsKebTybYZXyXu73C2xmlBC-Xy_Z48mWivvzw",
          },
        }
      );
      // List of orders from viettel post []
      setOrdersV(ordersResponse.data.data.data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const randomNumber = (baseNumber) => {
    let maxLimit = parseInt(baseNumber.toString().slice(0, 2));
    maxLimit = maxLimit - 1;
    const randomNaturalNumber = generateNaturalNumber(baseNumber.length - 2);
    const randomNumber = maxLimit.toString() + randomNaturalNumber.toString();
    return randomNumber;
  };

  const generateNaturalNumber = (n) => {
    if (n <= 0) {
      throw new Error("n must be a positive integer.");
    }

    const minLimit = Math.pow(10, n - 1); // Độ dài tối thiểu có n chữ số
    const maxLimit = Math.pow(10, n) - 1; // Độ dài tối đa có n chữ số
    const randomNaturalNumber =
      Math.floor(Math.random() * (maxLimit - minLimit + 1)) + minLimit;

    return randomNaturalNumber;
  };

  const getLinkPrintViettel = async (orderVId) => {
    try {
      const response = await axios.options(
        "https://cors-anywhere.herokuapp.com/https://api.viettelpost.vn/api/setting/encryptLinkPrintV2"
      );

      // Xác minh rằng yêu cầu preflight đã trả về trạng thái OK
      if (response.status !== 200) {
        console.log("Preflight request failed.");
        return;
      }
      let random = randomNumber(orderVId);
      console.log("getting link print...");
      const printResponse = await axios.post(
        "https://cors-anywhere.herokuapp.com/https://api.viettelpost.vn/api/setting/encryptLinkPrintV2",
        {
          TYPE: 100,
          ORDER_NUMBER: orderVId + "," + random,
          IS_SHOW_POSTAGE: 0,
          deviceId: "n99xapd6xyonzztnsfh9w",
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwOTE4NDE0ODQ4IiwiVXNlcklkIjo2NzMyMTMyLCJGcm9tU291cmNlIjo1LCJUb2tlbiI6IkVRUkVRSVpNWkhLVFVYTDgiLCJleHAiOjE2OTE3NDg0MzAsIlBhcnRuZXIiOjY3MzIxMzJ9.z4Ymv4PFsRw1oK1OdPeJBD0CuiUukQmjy4UqYLU5EOqr0KLtllsKebTybYZXyXu73C2xmlBC-Xy_Z48mWivvzw",
          },
        }
      );
      // List of orders from viettel post []
      setLinkPrintV(printResponse.data.data.enCryptUrl);

      console.log("Save status...");
      const statusUpdate = await axios.post(
        "https://cors-anywhere.herokuapp.com/https://api.viettelpost.vn/api/orders/saveOrderPrint",
        {
          OrderNumbers: [orderVId, random],
          Type: "Printed",
          isShowPostage: 0,
          deviceId: "n99xapd6xyonzztnsfh9w",
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <Page>
      <ui-title-bar title="Home Viettel Post">
        <button variant="primary" onClick={getOrders}>
          Get all order
        </button>
        {/* <button onClick={loginGetToken}>Login</button> */}
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
                    order?.customer?.displayName || "...",
                    order?.totalPrice + " VNĐ",
                    order?.displayFulfillmentStatus,
                    order?.displayFulfillmentStatus,
                    order?.currentSubtotalLineItemsQuantity,
                    <>
                      <button
                        onClick={() => {
                          createViettel(order?.id);
                        }}
                      >
                        🏴󠁧󠁢󠁥󠁮󠁧󠁿
                      </button>
                      <button
                        onClick={() => {
                          printViettel(order?.id);
                        }}
                      >
                        🖨️
                      </button>
                    </>,
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
