<template>
    
    <div class="app-container">
        <el-form ref="furnitureOrderRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="总金额" prop="totalMoney">
                <el-input v-model="form.totalMoney" placeholder="请输入总金额" disabled />
            </el-form-item>
            <el-form-item label="已支付金额" prop="paidMoney">
                <el-input v-model="form.paidMoney" placeholder="请输入已支付金额" disabled />
            </el-form-item>
            <el-form-item label="订单状态" prop="orderStatus">
                <el-select v-model="form.orderStatus" placeholder="请选择订单状态">
                    <el-option v-for="dict in order_status" :key="dict.value" :label="dict.label"
                        :value="dict.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="下单时间" prop="orderTime">
                <el-date-picker clearable v-model="form.orderTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择下单时间" :default-time="defaultTime">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="下单人" prop="orderUser">
                <el-input v-model="form.orderUser" placeholder="请输入下单人" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phoneNumber">
                <el-input v-model="form.phoneNumber" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="地区" prop="areaType">
                <el-radio-group v-model="form.areaType" @change="changeAreaType">
                    <el-radio value="1">乡镇</el-radio>
                    <el-radio value="2">县城</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="乡镇" prop="town" style="width: 200px" v-if="form.areaType == '1'">
                <el-select v-model="form.town" placeholder="请选择乡镇" clearable @change="townChange">
                    <el-option v-for="t in townArr" :key="t.code" :label="t.name" :value="t.code" />
                </el-select>
            </el-form-item>
            <el-form-item label="村委" prop="village" style="width: 200px" v-if="form.areaType == '1'">
                <el-select v-model="form.village" placeholder="请选择村委" clearable>
                    <el-option v-for="t in villageArr" :key="t.code" :label="t.name" :value="t.code" />
                </el-select>
            </el-form-item>
            <el-form-item label="几队" prop="dui" v-if="form.areaType == '1'">
                <el-input v-model="form.dui" placeholder="请输入几队" />
            </el-form-item>
            <el-form-item label="村庄" prop="subVillage" v-if="form.areaType == '1'">
                <el-input v-model="form.subVillage" placeholder="请输入村庄" />
            </el-form-item>
            <el-form-item label="县城地址" prop="urbanAddress" v-if="form.areaType == '2'">
                <el-input v-model="form.urbanAddress" placeholder="请输入地址" />
            </el-form-item>
            <el-form-item label="是否包含定制" prop="includeCustom">
                <el-radio-group v-model="form.includeCustom">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import {
  listFurnitureOrder,
  getFurnitureOrder,
  delFurnitureOrder,
  addFurnitureOrder,
  updateFurnitureOrder,
} from "@/api/order/furnitureOrder";
import useDistrictsStore from "@/store/modules/districts";
import { eventBus } from "@/utils/eventBus";
import { parseTime } from "element-plus/es/components/time-select/src/utils.mjs";

const districtsStore = useDistrictsStore();
const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict("order_status");

// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: false,
  },
});

const mytime = parseTime();
const showTown = ref(true);

// 使用 toRefs 将 reactive 对象转换为普通对象
let resetOrder = reactive({
  id: null,
  totalMoney: 0,
  paidMoney: 0,
  orderStatus: "1",
  orderTime: parseTime(),
  orderUser: null,
  phoneNumber: null,
  district: '411723',
  town: "411723103",
  village: null,
  dui: null,
  subVillage: null,
  remark: null,
  includeCustom: 'N',
  areaType: '1',
  urbanAddress: null,
});


const townArr = computed(() => districtsStore.getDistrictsByPCode("411723")); // 取平舆县的乡镇
const villageArr = computed(() => districtsStore.getDistrictsByPCode("411723103"));

const data = reactive({
  form: props.order ? { ...props.order } : { ...resetOrder },
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
    includeCustom: 'N'
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

function cancel() {
  eventBus.emit("FO:closeEditDlg");
}

function townChange() {
    form.value.village = null;
}

function changeAreaType(areaType) {
  if (areaType == '1') {
    showTown.value = true;
  } else {
    showTown.value = false;
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["furnitureOrderRef"].validate((valid) => {
    if (valid) {
      if (form.value.areaType == '2') {
        form.value.town = null;
        form.value.village = null;
        form.value.subVillage = null;
      }
      if (form.value.id != null) {
        updateFurnitureOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          eventBus.emit('FO:orderUpdated');
        });
      } else {
        addFurnitureOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          eventBus.emit("FO:orderUpdated");
        });
      }
    }
  });
}
</script>