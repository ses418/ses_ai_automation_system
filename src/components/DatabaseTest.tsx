import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    const results: any = {};

    try {
      // Test 1: Basic connection
      console.log('Testing basic Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('ses_segments')
        .select('count')
        .limit(1);
      
      results.connection = connectionError ? `Error: ${connectionError.message}` : 'Success';
      console.log('Connection test result:', connectionTest, connectionError);

      // Test 2: Count segments
      console.log('Testing segments count...');
      const { count: segmentsCount, error: segmentsError } = await supabase
        .from('ses_segments')
        .select('*', { count: 'exact', head: true });
      
      results.segmentsCount = segmentsError ? `Error: ${segmentsError.message}` : segmentsCount;
      console.log('Segments count result:', segmentsCount, segmentsError);

      // Test 3: Get actual segments
      console.log('Testing segments data fetch...');
      const { data: segmentsData, error: segmentsDataError } = await supabase
        .from('ses_segments')
        .select('segment_id, segment_name')
        .limit(3);
      
      results.segmentsData = segmentsDataError ? `Error: ${segmentsDataError.message}` : `Found ${segmentsData?.length || 0} segments`;
      console.log('Segments data result:', segmentsData, segmentsDataError);

      // Test 4: Test keywords
      console.log('Testing keywords...');
      const { data: keywordsData, error: keywordsError } = await supabase
        .from('ses_keywords')
        .select('keyword_id, keyword, segment_id')
        .limit(3);
      
      results.keywordsData = keywordsError ? `Error: ${keywordsError.message}` : `Found ${keywordsData?.length || 0} keywords`;
      console.log('Keywords result:', keywordsData, keywordsError);

      // Test 5: Test base URLs
      console.log('Testing base URLs...');
      const { data: baseUrlsData, error: baseUrlsError } = await supabase
        .from('ses_base_url')
        .select('base_url_id, base_url, segment_id')
        .limit(3);
      
      results.baseUrlsData = baseUrlsError ? `Error: ${baseUrlsError.message}` : `Found ${baseUrlsData?.length || 0} base URLs`;
      console.log('Base URLs result:', baseUrlsData, baseUrlsError);

      // Test 6: Test target companies
      console.log('Testing target companies...');
      const { data: companiesData, error: companiesError } = await supabase
        .from('target_companies_ses')
        .select('company_id, company_name')
        .limit(3);
      
      results.companiesData = companiesError ? `Error: ${companiesError.message}` : `Found ${companiesData?.length || 0} companies`;
      console.log('Companies result:', companiesData, companiesError);

    } catch (err: any) {
      setError(err.message);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }

    setTestResults(results);
  };

  useEffect(() => {
    // Run tests automatically on component mount
    runTests();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run Tests Again'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{test}:</span>
                <span className={typeof result === 'string' && result.startsWith('Error') ? 'text-red-600' : 'text-green-600'}>
                  {result}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800">Debug Information:</h4>
            <p className="text-sm text-blue-700 mt-1">
              Check the browser console (F12 → Console) for detailed logs of each test.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
