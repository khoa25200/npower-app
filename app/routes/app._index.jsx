// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
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
  Modal,
  DataTable,
  Loading,
  TextContainer,
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
              note
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
    "OrderId Viettel",
    "Date",
    "Customer",
    "Total",
    "Quantity",
    "Print",
  ];

  const [token, setToken] = useState("");

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
      console.log("khoa==>", orders);
    }
  }, [actionData]);

  useEffect(() => {
    console.log("List of orders from Viettel Post: =>", ordersV);
  }, [ordersV]);
  useEffect(() => {
    console.log("data have link print: =>", linkPrintV);
    handleOpenModal();
  }, [linkPrintV]);

  const getOrders = () => submit({}, { replace: true, method: "POST" });
  const printViettel = (orderIdV) => {
    console.log("print=> ", orderIdV);
    if ((token, ordersV, orderIdV)) {
      getLinkPrintViettel(orderIdV);
    } else {
      console.log("no data print");
    }
  };

  const createViettel = async (id) => {
    console.log("create=>", id);
    // must be have token

    // get orders on viettel post
    setToken(localStorage.getItem("token"));
    if (token) {
      try {
        console.log("create order...");
        setToken(localStorage.getItem("token"));

        const ordersResponse = await axios.post(
          "https://cors-anywhere.herokuapp.com/https://partner.viettelpost.vn/v2/order/createOrder",
          {
            ORDER_NUMBER: getIdFormGrapQL(id),
            GROUPADDRESS_ID: 5818802,
            CUS_ID: 722,
            DELIVERY_DATE: "11/10/2018 15:09:52",
            SENDER_FULLNAME: "Đăng Khoa",
            SENDER_ADDRESS: "229/48 tây thạnh",
            SENDER_PHONE: "0326123397",
            SENDER_EMAIL: "dangkhoa@navitech.co",
            SENDER_DISTRICT: 4,
            SENDER_PROVINCE: 1,
            SENDER_LATITUDE: 0,
            SENDER_LONGITUDE: 0,
            RECEIVER_FULLNAME: "Đăng Khoa- Test",
            RECEIVER_ADDRESS:
              "1 NKKN P.Nguyễn Thái Bình, Quận 1, TP Hồ Chí Minh",
            RECEIVER_PHONE: "0907882792",
            RECEIVER_EMAIL: "hoangnh50@fpt.com.vn",
            RECEIVER_PROVINCE: 34,
            RECEIVER_DISTRICT: 390,
            RECEIVER_WARDS: 7393,

            RECEIVER_LATITUDE: 0,
            RECEIVER_LONGITUDE: 0,
            PRODUCT_NAME: "Máy xay sinh tố Philips HR2118 2.0L ",
            PRODUCT_DESCRIPTION: "Máy xay sinh tố Philips HR2118 2.0L ",
            PRODUCT_QUANTITY: 1,
            PRODUCT_PRICE: 2292764,
            PRODUCT_WEIGHT: 40000,
            PRODUCT_LENGTH: 38,
            PRODUCT_WIDTH: 24,
            PRODUCT_HEIGHT: 25,
            PRODUCT_TYPE: "HH",
            ORDER_PAYMENT: 3,
            ORDER_SERVICE: "VCBO",
            ORDER_SERVICE_ADD: "",
            ORDER_VOUCHER: "",
            ORDER_NOTE: "cho xem hàng, không cho thử",
            MONEY_COLLECTION: 2292764,
            CHECK_UNIQUE: true,
            LIST_ITEM: [
              {
                PRODUCT_NAME: "Máy xay sinh tố Philips HR2118 2.0L ",
                PRODUCT_PRICE: 2150000,
                PRODUCT_WEIGHT: 2500,
                PRODUCT_QUANTITY: 1,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              token: token,
            },
          }
        );
        // List of orders from viettel post []
        if (ordersResponse?.data.error === true) {
          console.log(ordersResponse?.data.message);
        } else {
          console.log(
            "khoa=> order number res from vt=>: ",
            ordersResponse?.data?.data?.ORDER_NUMBER
          );
          updateOrderNote(id, ordersResponse?.data?.data?.ORDER_NUMBER || "");
          getOrders
        }
        // updateOrder({}, ordersResponse?.data?.data?.ORDER_NUMBER);
      } catch (error) {
        console.log("Error:", error);
      }
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
      console.log("getting orders...");
      setToken(localStorage.getItem("token"));

      const ordersResponse = await axios.post(
        "https://cors-anywhere.herokuapp.com/https://api.viettelpost.vn/api/supperapp/orderByStatusWeb",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
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
      setToken(localStorage.getItem("token"));
      if (token) {
        console.log("get link in...");
        const responsePrintCode = await axios.post(
          "https://cors-anywhere.herokuapp.com/https://partner.viettelpost.vn/v2/order/printing-code",
          { EXPIRY_TIME: getFutureTimestamp(2), ORDER_ARRAY: [orderVId] },
          {
            headers: {
              accept: "*/*",
              token: token,
            },
          }
        );

        if (responsePrintCode.data.error === true) {
          console.log("request error nhé");
        } else {
          setLinkPrintV({
            orderVId: orderVId,
            a5: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=1&bill=${responsePrintCode.data.message}&showPostage=1`,
            a6: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=2&bill=${responsePrintCode.data.message}&showPostage=1`,
            a7: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=100&bill=${responsePrintCode.data.message}&showPostage=1`,
          });
          // console.log(linkPrintV);
        }
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const graphqlUrl = `https://cors-anywhere.herokuapp.com/https://dangkhoa2520.myshopify.com/admin/api/2023-07/graphql.json`;

  const updateOrderNote = async (orderId, newNote) => {
    const query = `
      mutation {
        orderUpdate(input: {
          id: "${orderId}"
          note: "${newNote}"
        }) {
          order {
            id
            note
          }
        }
      }
    `;

    const headers = {
      "X-Shopify-Access-Token": "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",
    };
    const res = await axios
      .post(graphqlUrl, { query }, { headers })
      .then((response) => {
        console.log("Response:", response?.data);
      })
      .catch((error) => {
        console.error("Error:", error?.response);
      });

    return res?.data?.data;
  };

  const getFutureTimestamp = (minutes) => {
    const currentTime = new Date().getTime();
    const futureTime = currentTime + minutes * 60000; // 1 phút = 60000 milliseconds
    return futureTime;
  };

  const [active, setActive] = useState(false);

  const handleOpenModal = useCallback(() => setActive(!active), [active]);

  const activator = <Button onClick={handleOpenModal}>Open</Button>;

  const getIdFormGrapQL = (string) => {
    const parts = string.split("/");
    const orderNumber = parts[parts.length - 1];
    return orderNumber;
  };
  return (
    <Page>
      <ui-title-bar title="Home Viettel Post">
        <button variant="primary" onClick={getOrders}>
          Reload Orders
        </button>
        <button
          onClick={() => {
            // getOrdersViettel({
            //   TYPE: 0,
            //   INVENTORY: -1,
            //   ORDER505: -1,
            //   STATUS:
            //     "-100,-101,-102,-108,-109,-110,100,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570",
            //   DATE_TO: "10/08/2023",
            //   DATE_FROM: "28/07/2023",
            //   PAGE_INDEX: 1,
            //   PAGE_SIZE: 10,
            //   OTHER_PROPERTIES: "",
            //   ORDER_PAYMENT: "",
            //   REASON_RETURN: null,
            //   deviceId: "n99xapd6xyonzztnsfh9w",
            // });
            updateOrderNote(
              "gid://shopify/Order/5401317572888",
              "Đây là ghi chú mới"
            );
          }}
        >
          Get all order *Viettel
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
                    order?.note,
                    order?.createdAt,
                    order?.customer?.displayName || "...",
                    order?.totalPrice + " VNĐ",
                    order?.currentSubtotalLineItemsQuantity,
                    <>
                      <button
                        disabled={order.note ? true : false}
                        onClick={() => {
                          if (order?.id) {
                            createViettel(order?.id);
                          }
                        }}
                      >
                        🏴󠁧󠁢󠁥󠁮󠁧󠁿
                      </button>
                      <button
                        onClick={() => {
                          printViettel(order?.note);
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
      <Modal
        // activator={activator}
        open={active}
        onClose={handleOpenModal}
        title={`Print: #${linkPrintV?.orderVId}`}
      >
        <Modal.Section>
          <TextContainer>
            {linkPrintV ? (
              <>
                <a href={linkPrintV?.a5} target="_blank">
                  <Button outline>A5</Button>
                </a>
                <a href={linkPrintV?.a6} target="_blank">
                  <Button outline>A6</Button>
                </a>
                <a href={linkPrintV?.a7} target="_blank">
                  <Button outline>A7</Button>
                </a>
              </>
            ) : (
              <Loading />
            )}
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
