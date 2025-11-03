"use client";

import { DrawerForm, QueryParamType, UseStateFncType } from "@/typescript/types";
import {
  Button,
  ButtonProps,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Pagination,
  Select,
} from "antd";
import { Rule } from "antd/es/form";
import { NamePath } from "antd/es/form/interface";
import { DefaultOptionType } from "antd/es/select";
import { valueType } from "antd/es/statistic/utils";
import { SelectHandler } from "rc-select/lib/Select";
import {
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
  useState,
} from "react";
import { FaSearch } from "react-icons/fa";

type InputProps<T> = {
  label: ReactNode;
  name: NamePath;
  rules?: Rule[];
  style?: React.CSSProperties;
  value?: valueType;
  onChange?: T | undefined;
  prefix?: ReactNode;
  className?: string;
  placeholder?: string;
  type?: "text" | "number";
  disabled?: boolean;
  maxLength?: number;
} & (
  | { type?: "text" }
  | {
      type: "number";
      min?: number;
      max?: number;
      step?: number;
      precision?: number;
    }
);

export const TextInputStyled = (
  props: InputProps<ChangeEventHandler<HTMLInputElement>>
) => {
  const validationRules = props.rules || [];
  
  if (props.type !== "number") {
    validationRules.push({
      whitespace: true,
      message: "White spaces are not allowed",
    });
  }

  return (
    <Form.Item
      className={props.className}
      label={props.label}
      name={props.name}
      rules={validationRules}
    >
      <Input
        placeholder={
          props.placeholder || `Enter ${props.label?.toString().toLowerCase()}`
        }
        type={props.type || "text"}
        prefix={props.prefix}
        disabled={props.disabled}
        style={props.style}
        maxLength={props.maxLength}
      />
    </Form.Item>
  );
};

export const NumberInputStyled = (props: InputProps<any>) => {
  return (
    <Form.Item
      className={props.className}
      label={props.label}
      name={props.name}
      rules={props.rules}
    >
      <InputNumber
        placeholder={
          props.placeholder || `Enter ${props.label?.toString().toLowerCase()}`
        }
        {...(props.type === "number" && {
          min: props.min,
          max: props.max,
          step: props.step,
          precision: props.precision,
        })}
        prefix={props.prefix}
        disabled={props.disabled}
        style={{ ...props.style, width: "100%" }}
      />
    </Form.Item>
  );
};

export const TextPasswordStyled = (
  props: InputProps<ChangeEventHandler<HTMLInputElement>>
) => {
  return (
    <Form.Item
      label={props.label}
      className={props.className}
      name={props.name}
      rules={props.rules}
    >
      <Input.Password
        style={props.style}
        value={props.value}
        onChange={props.onChange}
        prefix={props.prefix}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />
    </Form.Item>
  );
};

export const ButtonStyled = (props: ButtonProps) => {
  return (
    <Button {...props} className={`rounded ${props.className || ""}`} onClick={props.onClick}>
      {props.children}
    </Button>
  );
};

interface SearchInputInterface {
  setparams: UseStateFncType<QueryParamType>;
  params: QueryParamType;
  className?: string;
}

const SearchInput = (props: SearchInputInterface) => {
  const { setparams, params, className } = props;
  const [search, setsearch] = useState("");

  const onSearch = (value: string) => {
    const temp = params.search;
    if (temp !== value.trim().toLowerCase()) {
      const search = value.replace(/\s+/g, " ").toLowerCase();
      setparams({
        ...params,
        search: search,
        page: 1,
      });
    }
  };

  return (
    <Input
      style={{ paddingLeft: "20px" }}
      suffix={
        <FaSearch
          className="cursor-pointer text-primary-500"
          onClick={() => onSearch(search)}
        />
      }
      className={`sm:w-1/4 w-full ${className}`}
      placeholder="Search"
      allowClear={true}
      onChange={(e) => {
        if (e.target.value === "" || e.target.value === null) {
          onSearch("");
        } else {
          setsearch(e.target.value.trim());
        }
      }}
      onPressEnter={(e) => onSearch(search)}
    />
  );
};

export const CommonPagination = (props: {
  setparams: UseStateFncType<QueryParamType>;
  params: QueryParamType;
  total: number;
}) => {
  const { params, total, setparams } = props;
  
  const onChange = (page: number, pageSize: number) => {
    setparams({
      ...params,
      page: page,
      limit: pageSize,
    });
  };

  return (
    <Pagination
      current={params.page}
      pageSize={params.limit}
      onChange={onChange}
      total={total}
    />
  );
};

type SelectInterface = InputProps<(value: string | number) => void> &
  Partial<{
    onChange:
      | ((
          value: string | number,
          option: DefaultOptionType | DefaultOptionType[]
        ) => void)
      | undefined;
    allowClear?: boolean;
    disabled?: boolean;
    onSelect: SelectHandler<string | number, DefaultOptionType> | undefined;
    filterOption: boolean;
    options: any[];
    optionTitle: string;
    optionValue: string;
    dropdownRender?: {
      visible: boolean;
      onClick: MouseEventHandler<HTMLElement>;
      name: ReactNode;
    };
    showSearch: boolean;
    loading: boolean;
    onSearch: (value: string) => void | undefined;
  }>;

export const CommonSelection = (props: SelectInterface) => {
  const {
    name,
    label,
    rules,
    style,
    allowClear,
    placeholder,
    value,
    disabled,
    onSelect,
    onChange,
    filterOption,
    options,
    optionTitle,
    optionValue,
    dropdownRender,
    className,
    loading,
    onSearch,
  } = props;
  
  const { Option } = Select;

  return (
    <Form.Item
      className={className}
      name={name}
      label={label || null}
      rules={rules}
    >
      <Select
        style={{ ...style, minHeight: "30px" }}
        loading={loading}
        showSearch={props.showSearch}
        allowClear={allowClear || false}
        placeholder={placeholder}
        value={value}
        disabled={disabled || false}
        onSelect={onSelect}
        onSearch={onSearch}
        onChange={(value) => {
          onChange!(value);
        }}
        dropdownRender={(menu) => (
          <>
            {menu}
            {dropdownRender?.visible && (
              <Button
                type="text"
                onClick={dropdownRender.onClick}
                icon={<i className="fa fa-plus" style={{ marginRight: "5px" }} />}
              >
                Add new {dropdownRender.name || "item"}
              </Button>
            )}
          </>
        )}
        filterOption={
          filterOption
            ? (input, option) =>
                `${option!.children}`
                  .toLowerCase()
                  .indexOf(input.toLowerCase().trim()) >= 0
            : undefined
        }
      >
        {options?.map((item: any, i: number) => {
          return (
            <Option value={optionValue ? item[`${optionValue}`] : item} key={i}>
              {optionTitle ? item[`${optionTitle}`] : item}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export const CommonDatePicker = (props: {
  label: ReactNode;
  name: NamePath;
  rules?: Rule[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: any;
}) => {
  return (
    <Form.Item
      className={props.className}
      label={props.label}
      name={props.name}
      rules={props.rules}
    >
      <DatePicker
        inputReadOnly={false}
        format="DD-MM-YYYY"
        className="w-full"
        onChange={props.onChange}
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
    </Form.Item>
  );
};

export function SearchWithButtons(props: {
  params: Partial<QueryParamType>;
  setparams: UseStateFncType<QueryParamType>;
  setForm?: UseStateFncType<DrawerForm>;
  extra?: ReactNode;
  onAddClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="w-full flex sm:flex-row flex-col gap-2 justify-between">
        <SearchInput
          params={props.params}
          setparams={props.setparams}
          className="w-full sm:w-[30%]"
        />
        <div className="flex flex-row gap-2 items-center justify-between">
          <ButtonStyled
            type="primary"
            onClick={() => {
              if (props.onAddClick) {
                return props.onAddClick();
              }
              props.setForm!({ open: true, mode: "Add" });
            }}
          >
            Add
          </ButtonStyled>
          {props.extra}
        </div>
      </div>
    </div>
  );
}

