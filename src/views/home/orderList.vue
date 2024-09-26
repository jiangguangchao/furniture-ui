<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="furnitureOrderList">
      <el-table-column label="地址" align="center" >
        <template #default="scope">
          <span>{{ formatAddress(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单人" align="center" prop="orderUser" />
      <el-table-column label="联系电话" align="center" prop="phoneNumber" />
      <el-table-column label="总金额" align="center" prop="totalMoney" />
      
      
      <el-table-column label="已支付金额" align="center" prop="paidMoney" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="paymentStatus">
        <template #default="scope">
          <dict-tag :options="order_payment_status" :value="scope.row.paymentStatus" />
        </template>
      </el-table-column>
      <el-table-column label="配送状态" align="center" prop="deliveryStatus">
        <template #default="scope">
          <dict-tag :options="order_delivery_status" :value="scope.row.deliveryStatus" />
        </template>
      </el-table-column>
      <el-table-column label="订单编号" align="center" prop="id" />
      <el-table-column label="下单时间" align="center" prop="orderTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>


<script setup name="FurnitureOrder">
import {
  listFurnitureOrder,
} from "@/api/order/furnitureOrder";
import detailTab from "./detailTab.vue"
import useDistrictsStore from "@/store/modules/districts";
import { eventBus } from "@/utils/eventBus";

const districtsStore = useDistrictsStore();
const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict("order_status");
const { order_delivery_status } = proxy.useDict("order_delivery_status");
const { order_payment_status } = proxy.useDict("order_payment_status");

const furnitureOrderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeOrderTime = ref([]);
const defaultTime = new Date(2000, 1, 1, 12, 0, 0);
const detailOpen = ref(false);
const detailTitle = ref("订单详情");
const currentOrder = ref({});

const data = reactive({
  form: {
    orderStatus: "1"
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    totalMoney: null,
    orderStatus: null,
    orderTime: null,
    orderUser: null,
    phoneNumber: null,
    town: "411723103",
    village: null,
  },
  rules: {
    orderStatus: [
      { required: true, message: "订单状态不能为空", trigger: "change" },
    ],
    orderUser: [{ required: true, message: "下单人不能为空", trigger: "blur" }],
    phoneNumber: [
      { required: true, message: "联系电话不能为空", trigger: "blur" },
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeOrderTime && "" != daterangeOrderTime) {
    queryParams.value.params["beginOrderTime"] = daterangeOrderTime.value[0];
    queryParams.value.params["endOrderTime"] = daterangeOrderTime.value[1];
  }
  listFurnitureOrder(queryParams.value).then((response) => {
    furnitureOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function handleDetail(row) {
  currentOrder.value = row;
  detailOpen.value = true;
}

function formatAddress(row){
  //如果是庙湾镇[411723103]的。不显示镇，只显示镇下面的地址
  var address = districtsStore.getNameByCode(row.town) + (row.dui ? row.dui + "队" : "") + row.subVillage;
  if (row.district != "411723103"){
    address = districtsStore.getNameByCode(row.town) + address;
  }
  return address;
}
</script>