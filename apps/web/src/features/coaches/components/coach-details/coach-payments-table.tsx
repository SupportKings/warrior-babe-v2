"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";

import { Briefcase, Plus } from "lucide-react";
import { coachPaymentColumns } from "./columns/coach-payments-columns";

type CoachPayment = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

interface CoachPaymentsTableProps {
  payments: CoachPayment[];
  coachId: string;
}

export function CoachPaymentsTable({ payments, coachId }: CoachPaymentsTableProps) {
  const handleAddPayment = () => {
    // TODO: Implement add payment
    console.log("Add payment for coach:", coachId);
  };

  const handleEditPayment = (paymentId: string) => {
    // TODO: Implement edit payment
    console.log("Edit payment:", paymentId);
  };

  const handleDeletePayment = (paymentId: string) => {
    // TODO: Implement delete payment
    console.log("Delete payment:", paymentId);
  };

  const columns = coachPaymentColumns({ 
    onEdit: handleEditPayment, 
    onDelete: handleDeletePayment 
  });

  const tableConfig = useUniversalTable<CoachPayment>({
    data: payments || [],
    totalCount: payments?.length || 0,
    columns: columns,
    columnsConfig: [], // No filters needed for detail view
    filters: [],
    onFiltersChange: () => {},
    enableSelection: false,
    pageSize: 10,
    serverSide: false,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Payments
          </CardTitle>
          <Button onClick={handleAddPayment} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payments && payments.length > 0 ? (
          <UniversalDataTable
            table={tableConfig.table}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Payments</h3>
            <p className="text-muted-foreground mb-4">
              No payments have been recorded for this team member yet.
            </p>
            <Button onClick={handleAddPayment} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}