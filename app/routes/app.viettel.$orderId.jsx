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
  Button,
  DatePicker,
  Select,
  RadioButton,
  Divider,
} from "@shopify/polaris";
import {
  useParams,
  Link,
  useLoaderData,
  useActionData,
  useSubmit,
  Form,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { admin } = await authenticate.admin(request);

  const orderId = `gid://shopify/Order/${params.orderId}`;
  const response = await admin.graphql(
    `#graphql
      query{
        order(id: "${orderId}") {
          note
          createdAt
          subtotalLineItemsQuantity
          totalPrice
          currentSubtotalLineItemsQuantity
          id
          name
          phone
          email
          customer {
            displayName
            firstName
            lastName
          }
        }
      }`
  );

  const responseJson = await response.json();

  const provinceRes = await axios.get(
    "https://partner.viettelpost.vn/v2/categories/listProvince",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    }
  );

  return json({
    order: responseJson.data.order,
    shop: session.shop.replace(".myshopify.com", ""),
    provinceResponse: provinceRes.data,
  });
};

export async function action({ request, params }) {
  const rawData = {
    ORDER_NUMBER: params.orderId + "1",
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
    RECEIVER_ADDRESS: "1 NKKN P.Nguyễn Thái Bình, Quận 1, TP Hồ Chí Minh",
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
  };

  const createOrderVResponse = await axios.post(
    "https://partner.viettelpost.vn/v2/order/createOrder",
    rawData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        token:
          "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwMzI2MTIzMzk3IiwiVXNlcklkIjoxMzEzNTAyMCwiRnJvbVNvdXJjZSI6NSwiVG9rZW4iOiJPNjNZT1hDQ1ZLQk9SNEdOUEoiLCJleHAiOjE2OTIwODgxNTQsIlBhcnRuZXIiOjEzMTM1MDIwfQ.pI6w8JipwiiRV2UwkzvjwrpIW2xWzDMrYPFjAXsNAXoYLMvAaK7lW7-rLLgCqesRRUAoTFdz5ufyrglKiDuCUQ",
      },
    }
  );
  return createOrderVResponse.data;
}

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

  return res;
};

// export const getProvince = async () => {
//   const provinceRes = await axios.get(
//     "https://cors-anywhere.herokuapp.com/https://partner.viettelpost.vn/v2/categories/listProvince",
//     {
//       headers: {
//         "Content-Type": "application/json",
//         // Authorization: `Bearer ${process.env.API_TOKEN}`,
//       },
//     }
//   );

//   return provinceRes.data;
// };

export default function CreateViettelPost() {
  const createOrderVResponse = useActionData();
  const submit = useSubmit();
  const shopOrdersData = useLoaderData();
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState(
    shopOrdersData.order.phone || ""
  );

  const [receiveName, setReceiveName] = useState(
    shopOrdersData.order?.customer?.displayName || ""
  );
  const [receivePhone, setReceivePhone] = useState(
    shopOrdersData.order?.customer?.phone || ""
  );

  const provinceData = shopOrdersData.provinceResponse;
  // console.log("ds Tỉnh==>", provinceData.data);
  const [senderEmail, setSenderEmail] = useState(
    shopOrdersData.order.email || ""
  );
  const [receiveEmail, setReceiveEmail] = useState(
    shopOrdersData?.order?.customer?.email || ""
  );

  const [senderSoNha, setSenderSoNha] = useState("");
  const [receiveSoNha, setReceiveSoNha] = useState("");

  const [selectedProvinceSender, setSelectedProvinceSender] = useState("1");
  const [selectedDistrictSender, setSelectedDistrictSender] = useState("1100");
  const [optionsDistrictSender, setOptionsDistrictSender] = useState([]);
  const [selectedWardSender, setSelectedWardSender] = useState("1");
  const [optionsWardSender, setOptionsWardSender] = useState([]);

  const [selectedProvinceReceive, setSelectedProvinceReceive] = useState("1");
  const [selectedDistrictReceive, setSelectedDistrictReceive] =
    useState("1100");
  const [optionsDistrictReceive, setOptionsDistrictReceive] = useState([]);
  const [selectedWardReceive, setSelectedWardReceive] = useState("1");
  const [optionsWardReceive, setOptionsWardReceive] = useState([]);

  const [valueProductType, setValueProductType] = useState("buukien");

  const [listProductsItem, setListProductsItem] = useState([
    {
      name: "",
      quan: 0,
      weight: 0,
      price: 0,
    },
  ]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date("Tue Sep 09 2023 00:00:00 GMT-0500 (EST)"),
    end: new Date("Tue Sep 09 2023 00:00:00 GMT-0500 (EST)"),
  });

  const handleMonthChangeDeliveryExpectation = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );
  useEffect(() => {
    const getDis = async () => {
      const responseDistrict = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listDistrict?provinceId=${selectedProvinceSender}`
      );
      // console.log("dis lists==>", responseDistrict);
      if (!responseDistrict.data.error) {
        setOptionsDistrictSender(
          responseDistrict.data.data?.map((value) => {
            return {
              label: value.DISTRICT_NAME,
              value: value.DISTRICT_ID.toString(),
            };
          })
        );
      } else {
        responseDistrict.data.message;
      }
    };
    getDis().catch(console.error);
  }, [selectedProvinceSender]);
  useEffect(() => {
    const getDis = async () => {
      const responseDistrict = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listDistrict?provinceId=${selectedProvinceReceive}`
      );
      // console.log("dis lists==>", responseDistrict);
      if (!responseDistrict.data.error) {
        setOptionsDistrictReceive(
          responseDistrict.data.data?.map((value) => {
            return {
              label: value.DISTRICT_NAME,
              value: value.DISTRICT_ID.toString(),
            };
          })
        );
      } else {
        responseDistrict.data.message;
      }
    };
    getDis().catch(console.error);
  }, [selectedProvinceReceive]);

  useEffect(() => {
    const getWardsSender = async () => {
      const responseWard = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listWards?districtId=${selectedDistrictSender}`
      );
      // console.log("dis lists==>", responseWard);
      if (!responseWard.data.error) {
        setOptionsWardSender(
          responseWard.data.data?.map((value) => {
            return {
              label: value.WARDS_NAME,
              value: value.WARDS_ID.toString(),
            };
          })
        );
      } else {
        responseWard.data.message;
      }
    };
    getWardsSender().catch(console.error);
  }, [selectedDistrictSender]);

  useEffect(() => {
    const getWardsReceiver = async () => {
      const responseWard = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listWards?districtId=${selectedDistrictReceive}`
      );
      // console.log("dis lists==>", responseWard);
      if (!responseWard.data.error) {
        setOptionsWardReceive(
          responseWard.data.data?.map((value) => {
            return {
              label: value.WARDS_NAME,
              value: value.WARDS_ID.toString(),
            };
          })
        );
      } else {
        responseWard.data.message;
      }
    };
    getWardsReceiver().catch(console.error);
  }, [selectedDistrictReceive]);

  useEffect(() => {
    if (
      selectedDistrictSender &&
      selectedProvinceSender &&
      selectedDistrictReceive &&
      selectedProvinceReceive &&
      valueProductType &&
      totalWeight &&
      totalPrice
    ) {
      const getServiceListMatch = async () => {
        const responseServiceList = await axios.post(
          `https://cors-anywhere.herokuapp.com/https://partner.viettelpost.vn/v2/order/getPriceAll`,
          {
            SENDER_DISTRICT: selectedDistrictSender,
            SENDER_PROVINCE: selectedProvinceSender,
            RECEIVER_DISTRICT: selectedDistrictReceive,
            RECEIVER_PROVINCE: selectedProvinceReceive,
            PRODUCT_TYPE: valueProductType === "tailieu" ? "TH" : "HH",
            PRODUCT_WEIGHT: totalWeight,
            PRODUCT_PRICE: totalPrice,
            MONEY_COLLECTION: "5000000",
            PRODUCT_LENGTH: 0,
            PRODUCT_WIDTH: 0,
            PRODUCT_HEIGHT: 0,
            TYPE: 1,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Token:
                "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwMzI2MTIzMzk3IiwiVXNlcklkIjoxMzEzNTAyMCwiRnJvbVNvdXJjZSI6NSwiVG9rZW4iOiJPNjNZT1hDQ1ZLQk9SNEdOUEoiLCJleHAiOjE2OTIxNjc1NzYsIlBhcnRuZXIiOjEzMTM1MDIwfQ.yswXUTsUmLN3YK7mvNFVHX5ViP-eGIq2JZs14_DcHMGMaUJZjDj8QNjhowxVTZYQD5PhppmCE06U3W7QjBVCjQ",
              // Cookie: "SERVERID=A"
            },
          }
        );
        console.log("Service List==>", responseServiceList);
        if (!responseServiceList.data.error) {
          // setOptionsWardReceive(
          //   responseServiceList.data.data?.map((value) => {
          //     return {
          //       label: value.WARDS_NAME,
          //       value: value.WARDS_ID.toString(),
          //     };
          //   })
          // );
        } else {
          responseServiceList.data.message;
        }
      };
      getServiceListMatch().catch(console.error);
    }
  }, [
    selectedDistrictSender,
    selectedProvinceSender,
    selectedDistrictReceive,
    selectedProvinceReceive,
    valueProductType,
    totalWeight,
    totalPrice,
  ]);

  const handleSelectChangeProvinceSender = useCallback(
    (value) => setSelectedProvinceSender(value),
    []
  );
  const handleSelectChangeDistrictSender = useCallback(
    (value) => setSelectedDistrictSender(value),
    []
  );
  const handleSelectChangeWardSender = useCallback(
    (value) => setSelectedWardSender(value),
    []
  );
  const handleSelectChangeProvinceReceive = useCallback(
    (value) => setSelectedProvinceReceive(value),
    []
  );
  const handleSelectChangeDistrictReceive = useCallback(
    (value) => setSelectedDistrictReceive(value),
    []
  );
  const handleSelectChangeWardReceive = useCallback(
    (value) => setSelectedWardReceive(value),
    []
  );

  const optionsProvince = provinceData.data?.map((value) => {
    return {
      label: value.PROVINCE_NAME,
      value: value.PROVINCE_ID.toString(),
    };
  });
  // console.log("opt", optionsProvince);
  const [orders, setOrders] = useState(shopOrdersData.order);
  console.log("order==>", orders);
  const params = useParams();
  const orderId = params.orderId;
  const handleCreateOrderViettelPost = () => {
    try {
      submit({}, { replace: true, method: "POST" });
      console.log("order created...==>", createOrderVResponse);
      if (createOrderVResponse.error === true) {
        console.log(createOrderVResponse.message);
      } else {
        console.log(
          "khoa=> order number res from vt=>: ",
          createOrderVResponse?.data?.ORDER_NUMBER
        );
        updateOrderNote(
          `gid://shopify/Order/${orderId}`,
          createOrderVResponse?.data?.ORDER_NUMBER || ""
        );
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };
  function formatDate(dateString) {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7); // Thêm 7 giờ để chuyển múi giờ
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
  function formatDateTime(dateTime) {
    const day = dateTime.getDate();
    const month = dateTime.getMonth() + 1;
    const year = dateTime.getFullYear();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }

  const handleChangeProductType = useCallback(
    (_, newValue) => setValueProductType(newValue),
    []
  );

  useEffect(() => {
    let totalQuan = 0;
    let totalWeight = 0;
    let totalPrice = 0;
    listProductsItem.forEach((value) => {
      totalQuan += value.quan;
      totalWeight += value.weight;
      totalPrice += value.price;
    });
    setTotalQuantity(totalQuan);
    setTotalWeight(totalWeight);
    setTotalPrice(totalPrice);
  }, [listProductsItem]);
  console.log("date post==>", {
    ORDER_NUMBER: params.orderId,
    GROUPADDRESS_ID: 0,
    CUS_ID: "",
    DELIVERY_DATE: formatDateTime(new Date()),
    SENDER_FULLNAME: senderName,
    SENDER_ADDRESS: `${senderSoNha ? senderSoNha + "," : ""} ${
      optionsWardSender?.find((w) => w?.value == selectedWardSender)?.label ||
      ""
    }, ${
      optionsDistrictSender?.find((dis) => dis?.value == selectedDistrictSender)
        ?.label || ""
    }, ${
      optionsProvince.find((value) => value.value == selectedProvinceSender)
        .label || ""
    }`,
    SENDER_PHONE: senderPhone,
    SENDER_EMAIL: senderEmail,
    SENDER_DISTRICT: selectedDistrictSender,
    SENDER_PROVINCE: selectedProvinceSender,
    SENDER_WARD: selectedWardSender,
    SENDER_LATITUDE: 0,
    SENDER_LONGITUDE: 0,
    RECEIVER_FULLNAME: receiveName,
    RECEIVER_ADDRESS: `${receiveSoNha ? receiveSoNha + "," : ""} ${
      optionsWardReceive?.find((w) => w?.value == selectedWardReceive)?.label ||
      ""
    }, ${
      optionsDistrictReceive?.find(
        (dis) => dis?.value == selectedDistrictReceive
      )?.label || ""
    }, ${
      optionsProvince.find((value) => value.value == selectedProvinceReceive)
        .label || ""
    }`,
    RECEIVER_PHONE: receivePhone,
    RECEIVER_EMAIL: receiveEmail,
    RECEIVER_PROVINCE: selectedProvinceReceive,
    RECEIVER_DISTRICT: selectedDistrictReceive,
    RECEIVER_WARDS: selectedWardReceive,
    RECEIVER_LATITUDE: 0,
    RECEIVER_LONGITUDE: 0,
    EXPECTED_DELIVERY_DATE: formatDate(selectedDates.end),
    PRODUCT_NAME: "Máy xay sinh tố Philips HR2118 2.0L ",
    PRODUCT_DESCRIPTION: "Máy xay sinh tố Philips HR2118 2.0L ",
    PRODUCT_QUANTITY: totalQuantity,
    PRODUCT_PRICE: totalPrice,
    PRODUCT_WEIGHT: totalWeight,
    PRODUCT_LENGTH: 0,
    PRODUCT_WIDTH: 0,
    PRODUCT_HEIGHT: 0,
    PRODUCT_TYPE: valueProductType === "tailieu" ? "TH" : "HH",
    ORDER_PAYMENT: 3,
    ORDER_SERVICE: "VCBO",
    ORDER_SERVICE_ADD: "",
    ORDER_VOUCHER: "",
    ORDER_NOTE: "cho xem hàng, không cho thử",
    MONEY_COLLECTION: 2292764,
    CHECK_UNIQUE: true,
    LIST_ITEM: listProductsItem.map((value) => {
      return {
        PRODUCT_NAME: value.name,
        PRODUCT_PRICE: value.price,
        PRODUCT_WEIGHT: value.weight,
        PRODUCT_QUANTITY: value.quan,
      };
    }),
  });
  return (
    <Page>
      <ui-title-bar title={`Create ViettelPost #${orderId}`} />
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <a
                  style={{ textDecoration: "none" }}
                  href={`https://admin.shopify.com/store/${shopOrdersData.shop}/orders/${orderId}`}
                  target="_blank"
                >
                  Edit order: #{orderId} --- Name: {shopOrdersData.order.name}📝
                </a>
                <TextField
                  label="Shopify Order .No:"
                  value={`#${params.orderId}`}
                  readOnly
                  autoComplete="off"
                />
                <b>NGƯỜI GỬI:</b>
                <FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      label="Tên Người Gửi:"
                      value={senderName}
                      onChange={(value) => {
                        setSenderName(value);
                      }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Số điện thoại người gửi:"
                      value={senderPhone}
                      type="tel"
                      onChange={(value) => {
                        setSenderPhone(value);
                      }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Email người gửi:"
                      value={senderEmail}
                      type="email"
                      onChange={(value) => {
                        setSenderEmail(value);
                      }}
                      autoComplete="off"
                    />
                    {/* <TextField
                      label="Số Nhà/Tên Đường:"
                      value={senderEmail}
                      type="email"
                      onChange={(value) => {
                        setSenderEmail(value);
                      }}
                      autoComplete="off"
                    /> */}
                  </FormLayout.Group>
                  <Card>
                    <FormLayout.Group>
                      <i>Địa chỉ người gửi:</i>
                      <Select
                        label="Thành Phố/Tỉnh:"
                        options={optionsProvince}
                        onChange={handleSelectChangeProvinceSender}
                        value={selectedProvinceSender}
                      />
                      <Select
                        label="Quận/Huyện:"
                        options={optionsDistrictSender}
                        onChange={handleSelectChangeDistrictSender}
                        value={selectedDistrictSender}
                      />
                      <Select
                        label="Phường/Xã:"
                        options={optionsWardSender}
                        onChange={handleSelectChangeWardSender}
                        value={selectedWardSender}
                      />
                      <TextField
                        label="Số Nhà, Tên Đường:"
                        value={senderSoNha}
                        onChange={(value) => {
                          setSenderSoNha(value);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        readOnly
                        label="Địa chỉ tự động:"
                        value={`${senderSoNha ? senderSoNha + "," : ""} ${
                          optionsWardSender?.find(
                            (w) => w?.value == selectedWardSender
                          )?.label || ""
                        }, ${
                          optionsDistrictSender?.find(
                            (dis) => dis?.value == selectedDistrictSender
                          )?.label || ""
                        }, ${
                          optionsProvince.find(
                            (value) => value.value == selectedProvinceSender
                          ).label || ""
                        }`}
                        autoComplete="off"
                      />
                    </FormLayout.Group>
                  </Card>
                </FormLayout.Group>

                <hr />
                <b>NGƯỜI NHẬN:</b>

                <FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      label="Tên Người Nhận:"
                      value={receiveName}
                      onChange={(value) => {
                        setReceiveName(value);
                      }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Số điện thoại người nhận:"
                      value={receivePhone}
                      type="tel"
                      onChange={(value) => {
                        setReceivePhone(value);
                      }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Email người nhận:"
                      value={receiveEmail}
                      type="email"
                      onChange={(value) => {
                        setReceiveEmail(value);
                      }}
                      autoComplete="off"
                    />
                    {/* <TextField
                      label="Email người nhận:"
                      value={receiveEmail}
                      type="email"
                      onChange={(value) => {
                        setReceiveEmail(value);
                      }}
                      autoComplete="off"
                    /> */}
                  </FormLayout.Group>
                  <Card>
                    <FormLayout.Group>
                      <label>Địa chỉ người nhận:</label>
                      <Select
                        label="Thành Phố/Tỉnh:"
                        options={optionsProvince}
                        onChange={handleSelectChangeProvinceReceive}
                        value={selectedProvinceReceive}
                      />
                      <Select
                        label="Quận/Huyện:"
                        options={optionsDistrictReceive}
                        onChange={handleSelectChangeDistrictReceive}
                        value={selectedDistrictReceive}
                      />
                      <Select
                        label="Phường/Xã:"
                        options={optionsWardReceive}
                        onChange={handleSelectChangeWardReceive}
                        value={selectedWardReceive}
                      />
                      <TextField
                        label="Số Nhà, Tên Đường:"
                        value={receiveSoNha}
                        onChange={(value) => {
                          setReceiveSoNha(value);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        readOnly
                        label="Địa chỉ tự động:"
                        value={`${receiveSoNha ? receiveSoNha + "," : ""} ${
                          optionsWardReceive?.find(
                            (w) => w?.value == selectedWardReceive
                          )?.label || ""
                        }, ${
                          optionsDistrictReceive?.find(
                            (dis) => dis?.value == selectedDistrictReceive
                          )?.label || ""
                        }, ${
                          optionsProvince.find(
                            (value) => value.value == selectedProvinceReceive
                          ).label || ""
                        }`}
                        autoComplete="off"
                      />
                    </FormLayout.Group>
                  </Card>
                </FormLayout.Group>

                <label>Chọn gian giao hàng dự kiến:</label>
                <DatePicker
                  month={month}
                  year={year}
                  onChange={setSelectedDates}
                  onMonthChange={handleMonthChangeDeliveryExpectation}
                  selected={selectedDates}
                />
                <hr />

                <b>Sản phẩm:</b>
                <FormLayout.Group>
                  {/* <FormLayout.Group> */}
                  <label>Loại sản phẩm:</label>
                  <RadioButton
                    label="Bưu kiện"
                    // helpText="Customers will only be able to check out as guests."
                    checked={valueProductType === "buukien"}
                    id="buukien"
                    name="buukien"
                    onChange={handleChangeProductType}
                  />
                  <RadioButton
                    label="Tài liệu"
                    // helpText="Customers will be able to check out with a customer account or as a guest."
                    id="tailieu"
                    name="tailieu"
                    checked={valueProductType === "tailieu"}
                    onChange={handleChangeProductType}
                  />
                </FormLayout.Group>
                <Divider />
                <label>Items:</label>
                {listProductsItem?.map((product, index) => {
                  return (
                    <>
                      <Card>
                        <FormLayout.Group title={`#Sản phẩm ${index + 1}:`}>
                          <TextField
                            label={`Tên hàng hóa:`}
                            placeholder="Tên hàng hóa"
                            value={product?.name}
                            onChange={(value) => {
                              let temp = [...listProductsItem];
                              temp[index].name = value;
                              setListProductsItem(temp);
                            }}
                            autoComplete="off"
                          />
                          <FormLayout.Group>
                            <TextField
                              label={`Số lượng:`}
                              placeholder=""
                              type="number"
                              value={product?.quan.toString()}
                              onChange={(value) => {
                                let temp = [...listProductsItem];
                                temp[index].quan = Number(value);
                                setListProductsItem(temp);
                              }}
                              autoComplete="off"
                            />
                            <TextField
                              label={`Khối lượng(g):`}
                              placeholder="g"
                              type="number"
                              value={product?.weight.toString()}
                              onChange={(value) => {
                                let temp = [...listProductsItem];
                                temp[index].weight = Number(value);
                                setListProductsItem(temp);
                              }}
                              autoComplete="off"
                            />
                            <TextField
                              label={`Giá trị(VNĐ):`}
                              placeholder="đ"
                              type="number"
                              value={product?.price.toString()}
                              onChange={(value) => {
                                let temp = [...listProductsItem];
                                temp[index].price = Number(value);
                                setListProductsItem(temp);
                              }}
                              autoComplete="off"
                            />
                          </FormLayout.Group>
                        </FormLayout.Group>
                        <Button
                          onClick={() => {
                            let temp = [...listProductsItem];
                            temp.splice(index, 1);
                            setListProductsItem(temp);
                            console.log("List Products", listProductsItem);
                          }}
                        >
                          🗑️
                        </Button>
                      </Card>
                      <br />
                    </>
                  );
                })}
                {/* </FormLayout.Group>
                </FormLayout.Group> */}
                <Button
                  destructive
                  onClick={() => {
                    let temp = [
                      ...listProductsItem,
                      {
                        name: "",
                        quan: 0,
                        weight: 0,
                        price: 0,
                      },
                    ];
                    setListProductsItem(temp);
                    console.log("List Products +", listProductsItem);
                  }}
                >
                  + Thêm Hàng Hóa
                </Button>
                <Divider />
                <label>Sản phẩm:</label>
                <FormLayout.Group>
                  <TextField
                    label="Tổng Số lượng:"
                    value={totalQuantity.toString()}
                    readOnly
                    autoComplete="off"
                  />
                  <TextField
                    label="Tổng Khối Lượng:"
                    value={totalWeight.toString()}
                    readOnly
                    autoComplete="off"
                  />
                  <TextField
                    label="Tổng Giá:"
                    value={totalPrice.toString()}
                    readOnly
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <Button onClick={() => handleCreateOrderViettelPost()}>
                  Create Order Viettel Post
                </Button>

                <Link to="/app">Back to Home page</Link>
              </FormLayout>
            </Form>
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
