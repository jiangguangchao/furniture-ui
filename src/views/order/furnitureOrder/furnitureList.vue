<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <!--订单状态是进行中的才可以新增-->
        <el-button type="primary" plain icon="Plus" v-if="order.orderStatus =='1'" @click="handleAdd"
          v-hasPermi="['order:orderFurniture:add']">新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="orderFurnitureList" @selection-change="handleSelectionChange" border>
      <el-table-column type="expand">
        <template #default="scope">
          <el-card class="box-card" style="margin-bottom: 10px; background-color: #f0f0f0;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <span>编号: {{ scope.row.id }}</span><br>
                <span>订单编号: {{ scope.row.orderId }}</span><br>
                <span>创建者: {{ scope.row.createBy }}</span><br>
                
              </div>
              <div>
                <span>更新者: {{ scope.row.updateBy }}</span><br>
                <span>创建时间: {{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span><br>
                <span>更新时间: {{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span><br>
                <span>家具编号: {{ parseTime(scope.row.createTime, '{y}{m}{d}{h}{i}{s}') + "0000" + scope.row.profit }}</span>
              </div>
            </div>
          </el-card>
          <el-card class="box-card" style="background-color: #f0f0f0;">
            <ImageUpload :modelValue="scope.row.uploadFiles.map(item => item.filePath)" 
              :picAssociationData="{ picAssociationId: scope.row.id, picAssociationType: 'OFI' }"
              :uploadDisabled="order.orderStatus !='1'"/>
          </el-card>
        </template>
      </el-table-column>
      <el-table-column label="家具类别" align="center" prop="category">
        <template #default="scope">
          <dict-tag :options="furniture_category" :value="scope.row.category" />
        </template>
      </el-table-column>
      <el-table-column label="材质" align="center" prop="material">
        <template #default="scope">
          <dict-tag :options="furniture_material" :value="scope.row.material" />
        </template>
      </el-table-column>
      <el-table-column label="尺寸" align="center" prop="size" >
        <template #default="scope">
          {{ scope.row.size ? scope.row.size + '米' : '' }}
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center" prop="money" />
      <el-table-column label="备注" align="center" prop="remark" />


      <!--订单状态是进行中的才可以修改或删除-->
      <el-table-column label="操作" v-if="order.orderStatus =='1'" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['order:orderFurniture:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['order:orderFurniture:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改订单中家具对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="orderFurnitureRef" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item> -->
        <el-form-item label="家具类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择家具类别" @change="categoryChange">
            <el-option v-for="dict in furniture_category" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="材质" prop="material">
          <el-select v-model="form.material" placeholder="请选择材质">
            <el-option v-for="dict in furniture_material" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="尺寸(单位：米)" prop="size" v-show="!isBed">
          <el-input-number v-model="form.size" placeholder="请输入尺寸" />
        </el-form-item>
        <el-form-item label="尺寸" prop="bedWidth" v-show="isBed">
          <el-select v-model="form.bedWidth" placeholder="请选择床宽">
            <el-option v-for="dict in bed_width" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="money">
          <el-input-number v-model="form.money" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="家具编号" prop="profit">
          <el-input-number v-model="form.profit"  />
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

<script setup name="OrderFurniture">
import {
  listOrderFurniture,
  getOrderFurniture,
  delOrderFurniture,
  addOrderFurniture,
  updateOrderFurniture,
} from "@/api/order/orderFurniture";
import { eventBus } from "@/utils/eventBus";
import { watch } from "vue";

// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

watch(() => props.order, () => {
  getList();
});

console.log(props.order);

const { proxy } = getCurrentInstance();
const { furniture_category } = proxy.useDict("furniture_category");
const { furniture_material } = proxy.useDict("furniture_material");
const { bed_width } = proxy.useDict("bed_width");

const orderFurnitureList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const isBed = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 1000,
    orderId: null,
  },
  rules: {
    category: [
      { required: true, message: "家具类别不能为空", trigger: "blur" },
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单中家具列表 */
function getList() {
  loading.value = true;
  queryParams.value.orderId = props.order.id;
  listOrderFurniture(queryParams.value).then((response) => {
    orderFurnitureList.value = response.rows;
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
    orderId: null,
    category: null,
    style: null,
    material: null,
    size: null,
    bedWidth: null,
    money: null,
    remark: null,
  };
  proxy.resetForm("orderFurnitureRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加订单中家具";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  categoryChange(row.category);
  form.value = row;
  open.value = true;
  title.value = "修改订单中家具";
}

function categoryChange(value) {
  isBed.value = value === "0";
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderFurnitureRef"].validate((valid) => {
    if (valid) {
      if (form.value.category === "0") {
        if (form.value.bedWidth === "0") {
          form.value.size = 1.2;
        } else if (form.value.bedWidth === "1") {
          form.value.size = 1.5;
        } else if (form.value.bedWidth === "2") {
          form.value.size = 1.8;
        } else if (form.value.bedWidth === "3") {
          form.value.size = 2;
        }
      }
      if (form.value.id != null) {
        updateOrderFurniture(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          eventBus.emit("orderUpdated");
          getList();
        });
      } else {
        form.value.orderId = props.order.id;
        addOrderFurniture(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          eventBus.emit("orderUpdated");
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除订单中家具编号为"' + _ids + '"的数据项？')
    .then(function () {
      return delOrderFurniture(_ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
      eventBus.emit("orderUpdated")
    })
    .catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "order/orderFurniture/export",
    {
      ...queryParams.value,
    },
    `orderFurniture_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
