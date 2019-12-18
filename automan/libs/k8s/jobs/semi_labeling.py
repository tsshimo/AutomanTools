import json
from kubernetes import client
from libs.k8s.jobs import BaseJob


class SemiLabeling(BaseJob):
    IMAGE_NAME = 'automan-label-lib'
    MEMORY = '2048Mi'

    # TODO: automan_server_info
    def __init__(
            self, automan_config, labeling_config, k8s_config_path=None):
        super(SemiLabeling, self).__init__(k8s_config_path)
        self.automan_info = json.dumps(automan_config, separators=(',', ':'))
        self.labeling_info = json.dumps(labeling_config, separators=(',', ':'))

    def create(self, name):
        self.job = client.models.V1Job(
            api_version='batch/v1', kind='Job',
            metadata=client.models.V1ObjectMeta(
                name=name,
            ),
            spec=client.models.V1JobSpec(
                # ttlSecondsAfterFinished = 45 Day
                ttl_seconds_after_finished=3888000,
                active_deadline_seconds=6000,
                completions=1,
                parallelism=1,
                # TODO: backoffLimit
                template=self.__get_pod()
            )
        )

    def __get_pod(self):
        try:
            pod_template_spec = client.models.V1PodTemplateSpec(
                spec=client.models.V1PodSpec(
                    restart_policy='Never',
                    containers=self.__get_containers()
                )
            )
            return pod_template_spec
        except:
            import traceback
            traceback.print_exc()

    def __get_containers(self):
        command = ["/app/bin/docker-entrypoint.bash"]
        args = ['python', '/app/sample_auto_labeling.py',
                '--automan_info', self.automan_info, '--labeling_info', self.labeling_info]
        system_usage = {'memory': self.MEMORY}
        containers = [
            client.models.V1Container(
                command=command,
                args=args,
                image=self.IMAGE_NAME,
                image_pull_policy='IfNotPresent',
                name=self.IMAGE_NAME,
                # env=[access_key_env, secret_key_env],
                resources=client.models.V1ResourceRequirements(limits=system_usage, requests=system_usage),
            )
        ]
        return containers

    def __get_volumes(self):
        volumes = [
            client.models.V1Volume(
                name=self.volume_name,
                persistent_volume_claim=client.models.V1PersistentVolumeClaimVolumeSource(claim_name=self.claim_name)
            ),
        ]
        return volumes
