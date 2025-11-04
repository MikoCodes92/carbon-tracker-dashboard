// src/shared/ui/ExportButton/ExportButton.tsx
import React from "react";
import { Dropdown, Button, message, Tooltip, Space } from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import styled from "styled-components";

// Declare autoTable function on jsPDF instance
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

const StyledDropdown = styled(Dropdown)`
  .ant-btn {
    border-radius: 12px;
    padding: 10px 20px;
    height: auto;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
    border-radius: 8px;
    transform: translateX(4px);
  }
`;

const ExportButtonContainer = styled.div`
  display: inline-block;
`;

export interface ExportData {
  title: string;
  description?: string;
  data: any[];
  columns?: { key: string; label: string }[];
  fileName?: string;
}

interface ExportButtonProps {
  data: ExportData;
  variant?: "primary" | "secondary";
  size?: "small" | "middle" | "large";
  onExportStart?: (format: string) => void;
  onExportSuccess?: (format: string) => void;
  onExportError?: (format: string, error: any) => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  variant = "primary",
  size = "middle",
  onExportStart,
  onExportSuccess,
  onExportError,
}) => {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleExportPDF = async () => {
    try {
      setLoading("pdf");
      onExportStart?.("pdf");

      // Create new PDF document
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: data.title,
        subject: "Carbon Footprint Analysis Report",
        author: "Carbon Footprint Analyzer",
        keywords: "carbon, footprint, sustainability, environment",
        creator: "Carbon Footprint Analyzer",
      });

      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(data.title, pageWidth / 2, 25, { align: "center" });

      // Add description if available
      let currentY = 40;
      if (data.description) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);

        const splitDescription = doc.splitTextToSize(
          data.description,
          pageWidth - 40
        );
        doc.text(splitDescription, 20, currentY);
        currentY += splitDescription.length * 6 + 15;
      }

      // Add generation date and info
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        20,
        currentY
      );
      currentY += 8;

      doc.text(`Total recommendations: ${data.data.length}`, 20, currentY);
      currentY += 15;

      // Prepare table data
      const headers = data.columns
        ? data.columns.map((col) => col.label)
        : ["Data"];

      const tableData = data.data.map((item) =>
        data.columns
          ? data.columns.map((col) => {
              const value = item[col.key];
              if (value === null || value === undefined) return "";
              return String(value);
            })
          : [JSON.stringify(item)]
      );

      // Add table using autoTable
      autoTable(doc, {
        startY: currentY,
        head: [headers],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
          cellPadding: 6,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { top: 10 },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.5,
        didDrawPage: (data) => {
          // Add footer to each page
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            "Carbon Footprint Analyzer - Environmental Sustainability Report",
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );

          // Page numbers
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: "right" }
          );
        },
      });

      // Save the PDF
      const fileName = `${
        data.fileName || data.title
      }_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      message.success("PDF exported successfully!");
      onExportSuccess?.("pdf");
    } catch (error) {
      console.error("PDF export error:", error);
      message.error("Failed to export PDF. Please try again.");
      onExportError?.("pdf", error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading("excel");
      onExportStart?.("excel");

      // Prepare worksheet data
      const worksheetData = data.columns
        ? data.data.map((item) => {
            const row: any = {};
            data.columns!.forEach((col) => {
              row[col.label] = item[col.key];
            });
            return row;
          })
        : data.data;

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Set column widths
      if (data.columns) {
        const colWidths = data.columns.map(() => ({ wch: 20 }));
        worksheet["!cols"] = colWidths;
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Carbon Analysis");

      // Add metadata
      workbook.Props = {
        Title: data.title,
        Subject: "Carbon Footprint Analysis Report",
        Author: "Carbon Footprint Analyzer",
        CreatedDate: new Date(),
      };

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `${
        data.fileName || data.title
      }_${new Date().getTime()}.xlsx`;
      saveAs(blob, fileName);

      message.success("Excel file exported successfully!");
      onExportSuccess?.("excel");
    } catch (error) {
      console.error("Excel export error:", error);
      message.error("Failed to export Excel file");
      onExportError?.("excel", error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportJSON = async () => {
    try {
      setLoading("json");
      onExportStart?.("json");

      const jsonData = {
        metadata: {
          title: data.title,
          description: data.description,
          exportedAt: new Date().toISOString(),
          version: "1.0",
          generatedBy: "Carbon Footprint Analyzer",
          totalItems: data.data.length,
        },
        data: data.data,
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });

      const fileName = `${
        data.fileName || data.title
      }_${new Date().getTime()}.json`;
      saveAs(blob, fileName);

      message.success("JSON file exported successfully!");
      onExportSuccess?.("json");
    } catch (error) {
      console.error("JSON export error:", error);
      message.error("Failed to export JSON file");
      onExportError?.("json", error);
    } finally {
      setLoading(null);
    }
  };

  const menuItems = {
    items: [
      {
        key: "pdf",
        label: (
          <MenuItem onClick={handleExportPDF}>
            <FilePdfOutlined style={{ color: "#ef4444", fontSize: 16 }} />
            <Space direction="vertical" size={0}>
              <span style={{ fontWeight: 600 }}>Export as PDF</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Best for printing
              </span>
            </Space>
          </MenuItem>
        ),
        disabled: loading !== null,
      },
      {
        key: "excel",
        label: (
          <MenuItem onClick={handleExportExcel}>
            <FileExcelOutlined style={{ color: "#10b981", fontSize: 16 }} />
            <Space direction="vertical" size={0}>
              <span style={{ fontWeight: 600 }}>Export as Excel</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Editable format
              </span>
            </Space>
          </MenuItem>
        ),
        disabled: loading !== null,
      },
      {
        key: "json",
        label: (
          <MenuItem onClick={handleExportJSON}>
            <FileTextOutlined style={{ color: "#3b82f6", fontSize: 16 }} />
            <Space direction="vertical" size={0}>
              <span style={{ fontWeight: 600 }}>Export as JSON</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Developer friendly
              </span>
            </Space>
          </MenuItem>
        ),
        disabled: loading !== null,
      },
    ],
  };

  const getButtonProps = () => {
    const base = {
      loading: loading !== null,
      icon: <DownloadOutlined />,
      size,
    };

    if (variant === "primary") {
      return {
        ...base,
        type: "primary" as const,
        style: {
          background: "linear-gradient(135deg, #10b981, #059669)",
          border: "none",
          borderRadius: "12px",
          boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
        },
      };
    }

    return {
      ...base,
      type: "default" as const,
      style: {
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        color: "#64748b",
        background: "white",
      },
    };
  };

  return (
    <ExportButtonContainer>
      <Tooltip title="Export report in multiple formats" placement="top">
        <StyledDropdown
          menu={menuItems}
          placement="bottomRight"
          trigger={["click"]}
          arrow
        >
          <Button {...getButtonProps()}>
            {loading ? "Exporting..." : "Export Report"}
          </Button>
        </StyledDropdown>
      </Tooltip>
    </ExportButtonContainer>
  );
};
