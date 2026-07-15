"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchCommand } from "@/components/shared/search-command";
import { ConnectorCard, ConnectorGrid } from "@/components/features/connectors";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlugZap, Wrench } from "lucide-react";

export default function ConnectorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Connectors"
        description="Connect your tools and services"
      />

      <SearchCommand
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      <Tabs defaultValue="installed">
        <TabsList>
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
        <TabsContent value="installed" className="mt-4">
          <ConnectorGrid />
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          <ConnectorGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
