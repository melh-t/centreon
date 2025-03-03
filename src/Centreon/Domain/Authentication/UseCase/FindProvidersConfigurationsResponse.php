<?php

/*
 * Copyright 2005 - 2021 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */

declare(strict_types=1);

namespace Centreon\Domain\Authentication\UseCase;

use Security\Domain\Authentication\Model\ProviderConfiguration;

class FindProvidersConfigurationsResponse
{
    /**
     * @var array<int, array<string, mixed>>
     */
    private $providersConfigurations = [];

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getProvidersConfigurations(): array
    {
        return $this->providersConfigurations;
    }

    /**
     * @param ProviderConfiguration[] $providersConfigurations
     */
    public function setProvidersConfigurations(array $providersConfigurations): void
    {
        foreach ($providersConfigurations as $providersConfiguration) {
            $this->providersConfigurations[] = [
                'id' => $providersConfiguration->getId(),
                'type' => $providersConfiguration->getType(),
                'name' => $providersConfiguration->getName(),
                'centreon_base_uri' => $providersConfiguration->getCentreonBaseUri(),
                'is_active' => $providersConfiguration->isActive(),
                'is_forced' => $providersConfiguration->isForced(),
                'authentication_uri' => $providersConfiguration->getAuthenticationUri(),
            ];
        }
    }
}
