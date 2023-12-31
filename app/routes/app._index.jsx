import { useEffect, useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import axios from "axios";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useNavigate,
  useSubmit,
  Link,
  Form,
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
  Modal,
  DataTable,
  Loading,
  TextContainer,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
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
    shop: session.shop.replace(".myshopify.com", ""),
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  });
};

export async function action({ request }) {
  const body = await request.formData();
  const _action = body.get("_action");
  const orderVIdPrint = body.get("orderVIdPrint");
  const token = body.get("token");
  if(!token){
    return "no token"
  }else{
    if (_action === "RELOAD_DATA") {
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
    } else if (_action === orderVIdPrint && orderVIdPrint && token) {
      const getFutureTimestamp = (minutes) => {
        const currentTime = new Date().getTime();
        const futureTime = currentTime + minutes * 60000; // 1 phút = 60000 milliseconds
        return futureTime;
      };
      const responsePrintCode = await axios.post(
        "https://partner.viettelpost.vn/v2/order/printing-code",
        { EXPIRY_TIME: getFutureTimestamp(2), ORDER_ARRAY: [orderVIdPrint] },
        {
          headers: {
            accept: "*/*",
            Token: token,
          },
        }
      );
      return {
        orderVId: orderVIdPrint,
        print: responsePrintCode.data,
      };
    } else {
      return "error chưa xác định";
    }
  }
}
export default function Index() {
  const shopOrdersData = useLoaderData();
  const [actionForm, setActionForm] = useState("");
  const [orderVIdPrint, setOrderVIdPrint] = useState("");
  const [orders, setOrders] = useState(shopOrdersData.orders);

  const columns = [
    "Shopify Order.No",
    "OrderId Viettel",
    "CreatedAt",
    "Customer",
    // "Total",
    "Quantity",
    "Actions",
  ];

  const [token, setToken] = useState("");
  useEffect(() => {
    const lcToken = localStorage.getItem("token");
    setToken(lcToken || "");
  }, []);

  const [ordersV, setOrdersV] = useState({});
  const [linkPrintV, setLinkPrintV] = useState({});
  const nav = useNavigation();
  const navigate = useNavigate();

  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    console.log("acction data: " + actionData);
    if (actionData?.orders) {
      setOrders(actionData.orders);
      console.log("khoa==>", orders);
    }
    if (actionData?.print) {
      if (actionData?.print.error === true) {
        console.log(actionData?.print?.message);
      } else {
        setLinkPrintV({
          orderVId: actionData?.orderVId,
          a5: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=1&bill=${actionData?.print?.message}&showPostage=1`,
          a6: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=2&bill=${actionData?.print?.message}&showPostage=1`,
          a7: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=100&bill=${actionData?.print?.message}&showPostage=1`,
        });
      }
    }
    if(actionData==="no token"){
      navigate("/app/login")
    }
  }, [actionData, orderVIdPrint]);

  useEffect(() => {
    console.log("List of orders from Viettel Post: =>", ordersV);
  }, [ordersV]);
  useEffect(() => {
    console.log("data have link print: =>", linkPrintV);
    handleOpenModal();
  }, [linkPrintV]);

  // const getOrders = () => submit({}, { replace: true, method: "POST" });
  // const printViettel = (orderIdV) => {
  //   console.log("print=> ", orderIdV);
  //   setToken(localStorage.getItem("token"));
  //   console.log("test khoa tokens", token);
  //   if (!token) {
  //     navigate("/app/login");
  //   } else {
  //     if ((ordersV, orderIdV)) {
  //       getLinkPrintViettel(orderIdV);
  //     } else {
  //       console.log("no data print");
  //     }
  //   }
  // };

  function convertUTCToVietnamTime(utcTimeString) {
    const utcTime = new Date(utcTimeString);
    utcTime.setHours(utcTime.getHours() + 7);

    return utcTime.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }
  const [active, setActive] = useState(false);

  const handleOpenModal = useCallback(() => setActive(!active), [active]);

  // const activator = <Button onClick={handleOpenModal}>Open</Button>;

  const getIdFormGrapQL = (string) => {
    const parts = string.split("/");
    const orderNumber = parts[parts.length - 1];
    return orderNumber;
  };

  return (
    <Page>
      <ui-title-bar title="Home Viettel Post">
      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Form method="post">
              <input type="hidden" name="_action" value={actionForm} readOnly />
              <input
                type="hidden"
                name="orderVIdPrint"
                value={orderVIdPrint}
                readOnly
              />
              <input type="hidden" name="token" value={token} readOnly />
              <button
                onClick={() => {
                  setActionForm("RELOAD_DATA");
                }}
              >
                Reload Data
              </button>
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
                      <a
                        style={{ textDecoration: "none" }}
                        href={`https://admin.shopify.com/store/${
                          shopOrdersData?.shop
                        }/orders/${getIdFormGrapQL(order?.id)}`}
                        target="_blank"
                      >
                        {`#...${order?.id.slice(-5)}`}
                        📝
                      </a>,
                      order?.note || (
                        <i style={{ backgroundColor: "yellow" }}>
                          Chưa tạo đơn Viettel Post
                        </i>
                      ),
                      convertUTCToVietnamTime(order?.createdAt),
                      order?.customer?.displayName || "...",
                      // order?.totalPrice + " VNĐ",
                      order?.currentSubtotalLineItemsQuantity,
                      <>
                        <Link to={`/app/viettel/${getIdFormGrapQL(order?.id)}`}>
                          <button
                            disabled={order.note ? true : false}
                            // onClick={() => {
                            //   if (order?.id) {
                            //     createViettel(order?.id);
                            //   }
                            // }}
                          >
                            🏴󠁧󠁢󠁥󠁮󠁧󠁿Tạo đơn
                          </button>
                        </Link>
                        <button
                          disabled={order.note ? false : true}
                          onClick={() => {
                              setToken(localStorage.getItem("token"));
                              setOrderVIdPrint(order?.note);
                              setActionForm(order?.note);
                          }}
                        >
                          🖨️In
                        </button>
                      </>,
                    ]) || []
                  }
                />
              </Card>
            </Form>
          </Layout.Section>
        </Layout>
      </VerticalStack>
      <Modal
        // activator={activator}
        open={!linkPrintV.orderVId ? false : active}
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
