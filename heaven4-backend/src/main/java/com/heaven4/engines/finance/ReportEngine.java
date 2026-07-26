package com.heaven4.engines.finance;

import java.util.List;

public interface ReportEngine {
    void generateEncryptedDailyReport();
    List<String> listHistoricalReports();
    byte[] downloadEncryptedReport(String filename);
}
