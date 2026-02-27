#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { resolveSectorSignals, scoreSignals } from '../../src/server/sector/signalsCore.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function testScoreRubric() {
  const scores = scoreSignals([
    'Toezicht en regelgeving verhogen druk',
    'Contractmacht en tariefonderhandeling verschuiven',
    'Arbeidsmarktkrapte verhoogt uitval',
  ]);

  assert(scores.regulatorPressureIndex > 0, 'regulator score expected > 0');
  assert(scores.contractPowerScore > 0, 'contract score expected > 0');
  assert(scores.arbeidsmarktdrukIndex > 0, 'labor score expected > 0');
}

async function testCacheAndFetchMock() {
  const cachePath = path.resolve(process.cwd(), 'sector-signals-cache.json');
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => ({
    ok: true,
    async text() {
      return '<rss><item>Regelgeving contract arbeidsmarkt update</item></rss>';
    },
  }));

  try {
    const first = await resolveSectorSignals('gezondheidszorg');
    assert(Array.isArray(first.signals) && first.signals.length > 0, 'first fetch should return signals');

    globalThis.fetch = (async () => {
      throw new Error('network should not be called due cache');
    });

    const second = await resolveSectorSignals('gezondheidszorg');
    assert(second.source === 'cache', 'second fetch should use cache');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

(async () => {
  await testScoreRubric();
  await testCacheAndFetchMock();
  console.log('unit smoke tests passed');
})();
