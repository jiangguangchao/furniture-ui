<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="总金额" prop="totalMoney">
        <el-input
          v-model="queryParams.totalMoney"
          placeholder="请输入总金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeOrderTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="下单人" prop="orderUser">
        <el-input
          v-model="queryParams.orderUser"
          placeholder="请输入下单人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下单人联系电话" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="请输入下单人联系电话"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="乡镇" prop="town">
        <el-select v-model="queryParams.town" placeholder="请选择乡镇" clearable>
          <el-option
            v-for="t in townArr"
            :key="t.code"
            :label="t.name"
            :value="t.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:furnitureOrder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:furnitureOrder:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:furnitureOrder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:furnitureOrder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="furnitureOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" align="center" prop="id" />
      <el-table-column label="总金额" align="center" prop="totalMoney" />
      <el-table-column label="已支付金额" align="center" prop="paidMoney" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" prop="orderTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单人" align="center" prop="orderUser" />
      <el-table-column label="下单人联系电话" align="center" prop="phoneNumber" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createUser" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:furnitureOrder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:furnitureOrder:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改家具订单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="furnitureOrderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="总金额" prop="totalMoney">
          <el-input v-model="form.totalMoney" placeholder="请输入总金额" />
        </el-form-item>
        <el-form-item label="已支付金额" prop="paidMoney">
          <el-input v-model="form.paidMoney" placeholder="请输入已支付金额" />
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-select v-model="form.orderStatus" placeholder="请选择订单状态">
            <el-option
              v-for="dict in order_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间" prop="orderTime">
          <el-date-picker clearable
            v-model="form.orderTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择下单时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="下单人" prop="orderUser">
          <el-input v-model="form.orderUser" placeholder="请输入下单人" />
        </el-form-item>
        <el-form-item label="下单人联系电话" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入下单人联系电话" />
        </el-form-item>
        <el-form-item label="几队" prop="dui">
          <el-input v-model="form.dui" placeholder="请输入几队" />
        </el-form-item>
        <el-form-item label="村庄" prop="subVillage">
          <el-input v-model="form.subVillage" placeholder="请输入村庄" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="FurnitureOrder">
import { listFurnitureOrder, getFurnitureOrder, delFurnitureOrder, addFurnitureOrder, updateFurnitureOrder } from "@/api/order/furnitureOrder";
import useDistrictsStore from '@/store/modules/districts'

const districtsStore = useDistrictsStore()

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict('order_status');

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

const townArr = computed(() => districtsStore.getDistrictsByPCode('411723'));
const villageArr = computed(() => districtsStore.getDistrictsByPCode('411723'));

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    totalMoney: null,
    orderStatus: null,
    orderTime: null,
    orderUser: null,
    phoneNumber: null,
    town: null,
    village: null,
  },
  rules: {
    totalMoney: [
      { required: true, message: "总金额不能为空", trigger: "blur" }
    ],
    paidMoney: [
      { required: true, message: "已支付金额不能为空", trigger: "blur" }
    ],
    orderStatus: [
      { required: true, message: "订单状态不能为空", trigger: "change" }
    ],
    orderUser: [
      { required: true, message: "下单人不能为空", trigger: "blur" }
    ],
    phoneNumber: [
      { required: true, message: "下单人联系电话不能为空", trigger: "blur" }
    ],
    // district: [
    //   { required: true, message: "区县不能为空", trigger: "change" }
    // ],
    // town: [
    //   { required: true, message: "乡镇不能为空", trigger: "change" }
    // ],
    // village: [
    //   { required: true, message: "村委不能为空", trigger: "change" }
    // ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询家具订单列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeOrderTime && '' != daterangeOrderTime) {
    queryParams.value.params["beginOrderTime"] = daterangeOrderTime.value[0];
    queryParams.value.params["endOrderTime"] = daterangeOrderTime.value[1];
  }
  listFurnitureOrder(queryParams.value).then(response => {
    furnitureOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    totalMoney: null,
    paidMoney: null,
    orderStatus: null,
    orderTime: null,
    orderUser: null,
    phoneNumber: null,
    district: null,
    town: null,
    village: null,
    dui: null,
    subVillage: null,
    createTime: null,
    createUser: null,
    remark: null
  };
  proxy.resetForm("furnitureOrderRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeOrderTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加家具订单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getFurnitureOrder(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改家具订单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["furnitureOrderRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateFurnitureOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFurnitureOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除家具订单编号为"' + _ids + '"的数据项？').then(function() {
    return delFurnitureOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/furnitureOrder/export', {
    ...queryParams.value
  }, `furnitureOrder_${new Date().getTime()}.xlsx`)
}

getList();
</script>
